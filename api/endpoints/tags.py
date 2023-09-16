from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import Tag as TagModel
from api.schemas import TagSchema, TagUpdateSchema, TagMinimalSchema

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Tag(Resource):
    method_decorators = [jwt_required()]

    def get(self, id: int):
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        tag = TagModel.query.get_or_404(id)
        schema = TagSchema()
        return {
            'status': 200,
            'data': schema.dump(tag)
        }

    def put(self, id: int):
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
            abort(400, {'error': 'ValidationError', 'message': e.messages})
        except IntegrityError as e:
            abort(400, {'error': 'IntegrityError', 'message': e.args})

    def delete(self, id: int):
        checkAccess(get_jwt(), ['Writer'])
        tag = TagModel.query.get_or_404(id)
        if (len(tag.requirement) > 0 or len(tag.requirement) > 0) \
                and request.args.get('force') is None:
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
            abort(400, {'error': 'ValidationError', 'message': e.messages})
        except IntegrityError as e:
            abort(400, {'error': 'IntegrityError', 'message': e.args})


class Tags(Resource):
    method_decorators = [jwt_required()]

    def get(self):
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

    def post(self):
        checkAccess(get_jwt(), ['Writer'])
        schema = TagSchema()
        try:
            tag = schema.load(request.json)
            db.session.add(tag)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(tag)
            }, 201
        except ValidationError as e:
            abort(400, {'error': 'ValidationError', 'message': e.messages})
        except IntegrityError as e:
            abort(400, {'error': 'IntegrityError', 'message': e.args})
