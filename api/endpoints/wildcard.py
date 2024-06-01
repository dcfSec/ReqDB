from flask_restful import Resource
from flask_jwt_extended import jwt_required


class Wildcard(Resource):
    """
    Base class for the API. It just returns a 404.
    """
    method_decorators = [jwt_required()]

    def get(self, path="/"):
        return {
            'status': 404,
            'error': 'NotFound',
            'message': 'Endpoint not found'
        }, 400
