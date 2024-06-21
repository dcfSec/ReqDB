from api.endpoints.base import BaseResource


class Wildcard(BaseResource):
    """
    Base class for the API. It just returns a 404.
    """

    def get(self, path="/"):
        return {
            'status': 404,
            'error': 'NotFound',
            'message': 'Endpoint not found'
        }, 400
