from api.endpoints.base import BaseRessource


class Wildcard(BaseRessource):
    """
    Base class for the API. It just returns a 404.
    """

    def get(self, path="/"):
        return {
            'status': 404,
            'error': 'NotFound',
            'message': 'Endpoint not found'
        }, 400
