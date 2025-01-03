from flask_restful import Resource
from os import getenv

class OAuthConfig(Resource):
    def get(self):
        """Gets the oauth config for login

        :return dict: OAuth config
        """

        return {
            'status': 200,
            'data': {
                "provider": "Entra ID",
                "tenant_id": getenv('OAUTH_APP_TENANT'),
                "client_id": getenv('OAUTH_APP_CLIENT_ID')
            }
        }