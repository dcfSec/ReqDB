from flask_restful import Resource


class Base(Resource):
    def get(self, path="/"):
        return {
            "status": 404,
            "error": "NotFound",
            "message": "Endpoint not found."
        }, 404
