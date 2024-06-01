from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import ExtraType as ExtraTypeModel
from api.schemas import ExtraTypeSchema
from api.endpoints.base import BaseRessources

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class ExtraType(Resource):
    """
    ExtraType class. This class represents an extra type object in the API
    """
    method_decorators = [jwt_required()]

    def get(self, id: int):
        """
        Returns a single extra type object or a 404

        Required roles:
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: ExtraType ressource or 404
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
        :return dict: Updated extra type ressource
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
        :return dict: Empty (204) if successfull, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        extraType = ExtraTypeModel.query.get_or_404(id)
        if (len(extraType.children) > 0) \
                and request.args.get('force') is None:
            abort(400, {
                'error': 'ValidationError',
                'message': [
                    'Requirement has extras. Use ?force to delete anyway'
                ]})
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


class ExtraTypes(BaseRessources):
    """
    ExtraTypes class, represents the extraTypes API to fetch all or add an
    extraType item
    """
    addSchemaClass = ExtraTypeSchema
    dumpSchemaClass = ExtraTypeSchema

    def get(self):
        """Get all extra type elements

        Required roles:
            - Reader
            - Writer

        :return list: All extra type elements
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraTypes = ExtraTypeModel.query.all()
        schema = ExtraTypeSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(extraTypes)
        }
