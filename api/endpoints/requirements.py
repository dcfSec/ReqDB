from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import Topic, Requirement as RequirementModel
from api.schemas import RequirementSchema, RequirementUpdateSchema

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Requirement(Resource):
    """
    Requirement class. This class represents a requirement object in the API
    """
    method_decorators = [jwt_required()]

    def get(self, id: int):
        """
        Returns a single requirement object or a 404

        Required roles:
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: Requirement ressource or 404
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        requirement = RequirementModel.query.get_or_404(id)
        schema = RequirementSchema()
        return {
            'status': 200,
            'data': schema.dump(requirement)
        }

    def put(self, id: int):
        """
        Updates a requirement item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Updated requirement ressource
        """
        checkAccess(get_jwt(), ['Writer'])
        requirement = RequirementModel.query.get_or_404(id)
        updateSchema = RequirementUpdateSchema()
        schema = RequirementSchema()
        try:
            requirement = updateSchema.load(
                request.json, instance=requirement,
                partial=True, session=db.session)
            if requirement.parentId is not None \
                    and Topic.query.get(requirement.parentId) is None:
                abort(400, {
                    'error': 'ValidationError',
                    'message': [
                        f'Parent with id {requirement.parentId} not found'
                    ]
                })
            if requirement.parentId is not None:
                parent = Topic.query.get_or_404(requirement.parentId)
                if parent.children != []:
                    abort(400, {
                        'error': 'ValidationError',
                        'message': [
                            "Parent Topic can't have children and requirements"
                        ]})
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
            - Writer

        :param int id: Item id
        :return dict: Empty (204) if successfull, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        requirement = RequirementModel.query.get_or_404(id)
        if (len(requirement.extras) > 0) \
                and request.args.get('force') is None:
            abort(400, {
                'error': 'ValidationError',
                'message': [
                    'Requirement has extras. Use ?force to delete anyway'
                ]})
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


class Requirements(Resource):
    """
    Requirements class, represents the Requirements API to fetch all or add a
    Requirement item
    """
    method_decorators = [jwt_required()]

    def get(self):
        """Get all requirement elements

        Required roles:
            - Reader
            - Writer

        :return list: All requirement elements
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        requirements = RequirementModel.query.all()
        schema = RequirementSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(requirements)
        }

    def post(self):
        """
        Adds a new requirement item

        Required roles:
            - Writer

        :return dict: The new requirement item
        """
        checkAccess(get_jwt(), ['Writer'])
        schema = RequirementUpdateSchema()
        try:
            requirement = schema.load(request.json, session=db.session)
            if requirement.parentId is not None:
                parent = Topic.query.get_or_404(requirement.parentId)
                if parent.children != []:
                    abort(400, {
                        'error': 'ValidationError',
                        'message': [
                            "Parent Topic can't have children and requirements"
                        ]})
            db.session.add(requirement)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(requirement)
            }, 201
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
