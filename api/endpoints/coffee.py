from api.helper import checkAccess

from api.endpoints.base import BaseResource, BaseResources

from flask_jwt_extended import get_jwt


class Coffee(BaseResource):
    """
    Catalogue class. This class represents a catalogue object in the API
    """

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
        }, 418
