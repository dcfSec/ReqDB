from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Coffee(Resource):
    """
    Catalogue class. This class represents a catalogue object in the API
    """
    method_decorators = [jwt_required()]

    def get(self):
        """
        Returns 418 when coffee is requested

        Required roles:
            - Reader
            - Writer

        :return dict: I'm a teapot
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])

        return {
            'status': 418,
            'data': 'I\'m a teapot'
        }
