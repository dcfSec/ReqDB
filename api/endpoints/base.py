from flask_restful import Resource


class Base(Resource):
    def get(self, path="/"):
        return {
            "status": "404",
            "name": "NotFound",
            "data": {
                "error": "NotFound",
                "message": [
                    "Endpoint not found."
                ]
            },
        }, 404
