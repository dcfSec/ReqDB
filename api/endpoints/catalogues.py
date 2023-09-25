from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.helper import checkAccess
from api.models import Catalogue as CatalogueModel
from api.schemas import CatalogueSchema, CatalogueMinimalSchema, \
    CatalogueUpdateSchema

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Catalogue(Resource):
    method_decorators = [jwt_required()]

    def get(self, id: int):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        if request.args.get('minimal') is not None:
            schema = CatalogueMinimalSchema()
        else:
            schema = CatalogueSchema()
        return {
            'status': 200,
            'data': schema.dump(catalogue)
        }

    def put(self, id: int):
        checkAccess(get_jwt(), ['Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        updateSchema = CatalogueUpdateSchema()
        schema = CatalogueSchema()
        try:
            catalogue = updateSchema.load(
                request.json, instance=catalogue,
                partial=True, session=db.session)

            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(catalogue)
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
        catalogue = CatalogueModel.query.get_or_404(id)
        if (len(catalogue.extras) > 0) \
                and request.args.get('force') is None:
            abort(400, {
                'error': 'ValidationError',
                'message': [
                    'Catalogue has extras. Use ?force to delete anyway'
                ]})
        try:
            db.session.delete(catalogue)
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


class Catalogues(Resource):
    method_decorators = [jwt_required()]

    def get(self):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        catalogues = CatalogueModel.query.all()
        if request.args.get('minimal') is not None:
            schema = CatalogueMinimalSchema(many=True)
        else:
            schema = CatalogueSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(catalogues)
        }

    def post(self):
        checkAccess(get_jwt(), ['Writer'])
        schema = CatalogueUpdateSchema()
        try:
            catalogue = schema.load(request.json, session=db.session)
            db.session.add(catalogue)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(catalogue)
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
