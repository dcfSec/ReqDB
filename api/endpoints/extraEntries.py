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
    method_decorators = [jwt_required()]

    def get(self, id: int):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        schema = ExtraEntrySchema()
        return {
            'status': 200,
            'data': schema.dump(extraEntry)
        }

    def put(self, id: int):
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
    method_decorators = [jwt_required()]

    def get(self):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraEntries = ExtraEntryModel.query.all()
        schema = ExtraEntrySchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(extraEntries)
        }

    def post(self):
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
