from flask_restful import Resource


class Base(Resource):
    """
    Base class for the API. It just returns a 404.
    """
    def get(self, path="/"):
        return {
            "status": 404,
            "error": "NotFound",
            "message": "Endpoint not found."
        }, 404
