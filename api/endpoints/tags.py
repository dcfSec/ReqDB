from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import Tag as TagModel
from api.schemas import TagSchema, TagUpdateSchema, TagMinimalSchema
from api.endpoints.base import BaseRessources

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Tag(Resource):
    """
    Tag class. This class represents a tag object in the API
    """
    method_decorators = [jwt_required()]

    def get(self, id: int):
        """
        Returns a single tag object or a 404

        Required roles:
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: Tag ressource or 404
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        tag = TagModel.query.get_or_404(id)
        schema = TagSchema()
        return {
            'status': 200,
            'data': schema.dump(tag)
        }

    def put(self, id: int):
        """
        Updates a tag item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Updated tag ressource
        """
        checkAccess(get_jwt(), ['Writer'])
        tag = TagModel.query.get_or_404(id)
        updateSchema = TagUpdateSchema()
        if request.args.get('minimal') is not None:
            schema = TagSchema()
        else:
            schema = TagSchema()
        try:
            tag = updateSchema.load(request.json, instance=tag, partial=True,
                                    session=db.session)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(tag)
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
        Deletes a tag item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Empty (204) if successfull, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        tag = TagModel.query.get_or_404(id)
        if len(tag.requirement) > 0 and request.args.get('force') is None:
            abort(400, {
                'error': 'ValidationError',
                'message': [
                    'Tag has requirements. Use ?force to delete anyway'
                ]})
        try:
            db.session.delete(tag)
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


class Tags(BaseRessources):
    """
    Tags class, represents the Tags API to fetch all or add a
    tag item
    """
    addSchemaClass = TagSchema
    dumpSchemaClass = TagSchema

    def get(self):
        """Get all tag elements

        Required roles:
            - Reader
            - Writer

        :return list: All tag elements
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        tags = TagModel.query.all()
        if request.args.get('minimal') is not None:
            schema = TagMinimalSchema(many=True)
        else:
            schema = TagSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(tags)
        }
