from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import ExtraType as ExtraTypeModel
from api.schemas import ExtraTypeSchema

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class ExtraType(Resource):
    method_decorators = [jwt_required()]

    def get(self, id: int):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraType = ExtraTypeModel.query.get_or_404(id)
        schema = ExtraTypeSchema()
        return {
            'status': 200,
            'data': schema.dump(extraType)
        }

    def put(self, id: int):
        checkAccess(get_jwt(), ['Writer'])
        extraType = ExtraTypeModel.query.get_or_404(id)
        schema = ExtraTypeSchema()
        try:
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


class ExtraTypes(Resource):
    method_decorators = [jwt_required()]

    def get(self):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        extraTypes = ExtraTypeModel.query.all()
        schema = ExtraTypeSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(extraTypes)
        }

    def post(self):
        checkAccess(get_jwt(), ['Writer'])
        schema = ExtraTypeSchema()
        try:
            extraType = schema.load(request.json)
            db.session.add(extraType)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(extraType)
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
