from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import ExtraEntry as ExtraEntryModel
from api.schemas import ExtraEntrySchema, ExtraEntryUpdateSchema

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class ExtraEntry(Resource):
    """
    ExtraEntry class. This class represents an extra entry object in the API
    """
    method_decorators = [jwt_required()]

    def get(self, id: int):
        """
        Returns a single extra entry object or a 404

        Required roles:
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: ExtraEntry ressource or 404
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        schema = ExtraEntrySchema()
        return {
            'status': 200,
            'data': schema.dump(extraEntry)
        }

    def put(self, id: int):
        """
        Updates an extra entry item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Updated extra entry ressource
        """
        checkAccess(get_jwt(), ['Writer'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        updateSchema = ExtraEntryUpdateSchema()
        schema = ExtraEntrySchema()
        try:
            extraEntry = updateSchema.load(
                request.json, instance=extraEntry,
                partial=True, session=db.session)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(extraEntry)
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
        Deletes an extra entry item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Empty (204) if successfull, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        try:
            db.session.delete(extraEntry)
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


class ExtraEntries(Resource):
    """
    ExtraEntries class, represents the extraEntries API to fetch all or add an
    extraEntries item
    """
    method_decorators = [jwt_required()]

    def get(self):
        """Get all extra entries elements

        Required roles:
            - Reader
            - Writer

        :return list: All extra entries elements
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraEntries = ExtraEntryModel.query.all()
        schema = ExtraEntrySchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(extraEntries)
        }

    def post(self):
        """
        Adds a new extra entry item

        Required roles:
            - Writer

        :return dict: The new extra entry item
        """
        checkAccess(get_jwt(), ['Writer'])
        updateSchema = ExtraEntryUpdateSchema()
        schema = ExtraEntrySchema()
        try:
            extraEntry = updateSchema.load(request.json, session=db.session)
            db.session.add(extraEntry)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(extraEntry)
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
