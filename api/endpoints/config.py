from flask_restful import Resource
from os import getenv


class Static(Resource):
    def get(self):
        """Gets the oauth config for login

        :return dict: OAuth config
        """

        return {
            "status": 200,
            "data": {
                "oauth": {
                    "provider": "Entra ID",
                    "authority": getenv("OAUTH_APP_AUTHORITY"),
                    "client_id": getenv("OAUTH_APP_CLIENT_ID"),
                },
                "home": {
                    "title": getenv("STATIC_HOME_TITLE", "Welcome to ReqDB"),
                    "MOTD": {
                        "pre": getenv("STATIC_HOME_MOTD_PRE", ""),
                        "post": getenv("STATIC_HOME_MOTD_POST", ""),
                    },
                },
            },
        }
