from flask_restful import Resource
from flask import request

from api import db
from api.helper import checkAccess
from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class BaseResource(Resource):
    method_decorators = [jwt_required()]


class BaseResources(Resource):
    method_decorators = [jwt_required()]

    neededPostAccess = ['Requirements.Writer']
    neededGetAccess = ['Requirements.Reader']

    addSchemaClass = None
    dumpSchemaClass = None
    model = None

    def get(self):
        """Get all elements

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :return list: All elements
        """
        checkAccess(get_jwt(), self.neededGetAccess)
        data = self.model.query.all()
        schema = self.getDynamicSchema()(many=True)
        return {
            'status': 200,
            'data': schema.dump(data)
        }

    def post(self):
        """
        Adds a new item

        Required roles:
            - Requirements.Writer

        :return dict: The new item
        """
        checkAccess(get_jwt(), self.neededPostAccess)
        try:
            if "id" in request.json:
                del request.json["id"]
            data = self.checkRequest(request.json)
            object = self.addSchemaClass().load(data,
                                                session=db.session)
            self.check(object)
            db.session.add(object)
            db.session.commit()
            return {
                'status': 200,
                'data': self.dumpSchemaClass().dump(object)
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

    def check(self, object):
        pass

    def getDynamicSchema(self):
        return self.dumpSchemaClass
    
    def checkRequest(self, data):
        return data
