from flask import request
from flask_jwt_extended import get_jwt
from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api.appDefinition import db
from api.endpoints.base import BaseResource, BaseResources
from api.helper import checkAccess
from api.models import Requirement as RequirementModel
from api.models import Topic
from api.schemas import RequirementCommentsSchema, RequirementSchema
from api.updateSchemas import RequirementUpdateSchema


class Requirement(BaseResource):
    """
    Requirement class. This class represents a requirement object in the API
    """

    def get(self, id: int):
        """
        Returns a single requirement object or a 404

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :param int id: The object id to use in the query
        :return dict: Requirement resource or 404
        """
        checkAccess(get_jwt(), ['Requirements.Reader'])
        requirement = RequirementModel.query.get_or_404(id)
        if 'Comments.Reader' in get_jwt()['roles']:
            schema = RequirementCommentsSchema()
        else:
            schema = RequirementSchema()
        return {
            'status': 200,
            'data': schema.dump(requirement)
        }

    def put(self, id: int):
        """
        Updates a requirement item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Updated requirement resource
        """
        checkAccess(get_jwt(), ['Requirements.Writer'])
        requirement = RequirementModel.query.get_or_404(id)
        updateSchema = RequirementUpdateSchema()
        schema = RequirementSchema()
        try:
            requirement = updateSchema.load(
                request.json, instance=requirement,
                partial=True, session=db.session)
            if requirement.parentId is not None \
                    and Topic.query.get(requirement.parentId) is None:
                return {
                    'status': 400,
                    'error': 'ValidationError',
                    'message': [
                        f'Parent with id {requirement.parentId} not found'
                    ]
                }, 400
            if requirement.parentId is not None:
                parent = Topic.query.get_or_404(requirement.parentId)
                if parent.children != []:
                    return {
                        'status': 400,
                        'error': 'ValidationError',
                        'message': [
                            "Parent Topic can't have children and requirements"
                        ]}, 400
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(requirement)
            }
        except ValidationError as e:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': e.messages
            }, 400
        except IntegrityError as e:
            return {
                'status': 400,
                'error':
                'IntegrityError',
                'message': e.args
            }, 400

    def delete(self, id: int):
        """
        Deletes a requirement item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Empty (204) if successful, else error message
        """
        checkAccess(get_jwt(), ['Requirements.Writer'])
        requirement = RequirementModel.query.get_or_404(id)
        if (len(requirement.extras) > 0) \
                and request.args.get('force') is None:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': [
                    'Requirement has extras. Use ?force to delete anyway (This will also delete extras and comments).'
                ]}, 400
        if (len(requirement.comments) > 0) \
                and request.args.get('force') is None:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': [
                    'Requirement has comments. Use ?force to delete anyway (This will also delete extras and comments).'
                ]}, 400
        try:
            db.session.delete(requirement)
            db.session.commit()
            return {}, 204
        except ValidationError as e:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': e.messages
            }, 400
        except IntegrityError as e:
            return {
                'status': 400,
                'error':
                'IntegrityError',
                'message': e.args
            }, 400


class Requirements(BaseResources):
    """
    Requirements class, represents the Requirements API to fetch all or add a
    Requirement item
    """
    addSchemaClass = RequirementUpdateSchema
    dumpSchemaClass = RequirementSchema
    model = RequirementModel

    def check(self, object):
        if object.parentId is not None:
            parent = Topic.query.get_or_404(object.parentId)
            db.session.add(parent)
            if parent.children != []:
                return {
                    'status': 400,
                    'error': 'ValidationError',
                    'message': [
                        "Parent Topic can't have children and requirements"
                    ]}, 400

    def getDynamicSchema(self):
        if 'Comments.Reader' in get_jwt()['roles']:
            return RequirementCommentsSchema
        else:
            return RequirementSchema
