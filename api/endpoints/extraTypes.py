from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import ExtraType as ExtraTypeModel
from api.schemas import ExtraTypeSchema
from api.endpoints.base import BaseResource, BaseResources

from api.helper import checkAccess

from flask_jwt_extended import get_jwt


class ExtraType(BaseResource):
    """
    ExtraType class. This class represents an extra type object in the API
    """

    def get(self, id: int):
        """
        Returns a single extra type object or a 404

        Required roles:
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: ExtraType resource or 404
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraType = ExtraTypeModel.query.get_or_404(id)
        schema = ExtraTypeSchema()
        return {
            'status': 200,
            'data': schema.dump(extraType)
        }

    def put(self, id: int):
        """
        Updates an extra type item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Updated extra type resource
        """
        checkAccess(get_jwt(), ['Writer'])
        extraType = ExtraTypeModel.query.get_or_404(id)
        schema = ExtraTypeSchema()
        try:
            extraType = schema.load(
                request.json, instance=extraType,
                partial=True, session=db.session)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(extraType)
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
        Deletes an extra type item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Empty (204) if successful, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        extraType = ExtraTypeModel.query.get_or_404(id)
        if (len(extraType.children) > 0) \
                and request.args.get('force') is None:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': [
                    'Requirement has extras. Use ?force to delete anyway'
                ]}, 400
        try:
            db.session.delete(extraType)
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


class ExtraTypes(BaseResources):
    """
    ExtraTypes class, represents the extraTypes API to fetch all or add an
    extraType item
    """
    addSchemaClass = ExtraTypeSchema
    dumpSchemaClass = ExtraTypeSchema
    model = ExtraTypeModel
