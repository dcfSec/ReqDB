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
    method_decorators = [jwt_required()]

    def get(self, id: int):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        requirement = RequirementModel.query.get_or_404(id)
        schema = RequirementSchema()
        return {
            'status': 200,
            'data': schema.dump(requirement)
        }

    def put(self, id: int):
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
            abort(400, {'error': 'ValidationError', 'message': e.messages})
        except IntegrityError as e:
            abort(400, {'error': 'IntegrityError', 'message': e.args})

    def delete(self, id: int):
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
            abort(400, {'error': 'ValidationError', 'message': e.messages})
        except IntegrityError as e:
            abort(400, {'error': 'IntegrityError', 'message': e.args})


class Requirements(Resource):
    method_decorators = [jwt_required()]

    def get(self):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        requirements = RequirementModel.query.all()
        schema = RequirementSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(requirements)
        }

    def post(self):
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
            abort(400, {'error': 'ValidationError', 'message': e.messages})
        except IntegrityError as e:
            abort(400, {'error': 'IntegrityError', 'message': e.args})
