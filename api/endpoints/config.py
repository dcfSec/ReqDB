from flask import request
from flask_jwt_extended import get_jwt, jwt_required
from flask_restful import Resource
from os import getenv

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api.appDefinition import db
from api.helper import checkAccess
from api.models import Configuration
from api.schemas import ConfigurationSchema


class Static(Resource):
    def get(self):
        """Gets the oauth config for login

        :return dict: OAuth config
        """

        homeTitle = Configuration.query.get("HOME_TITLE")
        homeMOTDPre = Configuration.query.get("HOME_MOTD_PRE")
        homeMOTDPost = Configuration.query.get("HOME_MOTD_POST")

        return {
            "status": 200,
            "data": {
                "oauth": {
                    "provider": getenv("OAUTH_PROVIDER"),
                    "authority": getenv("OAUTH_AUTHORITY"),
                    "client_id": getenv("OAUTH_CLIENT_ID"),
                },
                "home": {
                    "title": homeTitle.value if homeTitle and homeTitle.value != "" else "Welcome to ReqDB",
                    "MOTD": {
                        "pre": homeMOTDPre.value if homeMOTDPre else "",
                        "post": homeMOTDPost.value if homeMOTDPost else "",
                    },
                },
            },
        }

class ConfigItem(Resource):
    method_decorators = [jwt_required()]

    neededPostAccess = ['Configuration.Writer']
    neededGetAccess = ['Configuration.Reader']


    def get(self, key: str):
        checkAccess(get_jwt(), self.neededGetAccess)
        item = Configuration.query.get_or_404(key)
        schema = ConfigurationSchema()
        return {
            'status': 200,
            'data': schema.dump(item)
        }

    def put(self, key: str):
        checkAccess(get_jwt(), ['Comments.Writer'])
        item = Configuration.query.get_or_404(key)
        schema = ConfigurationSchema()
        try:
            item = schema.load(
                request.json, instance=item,
                partial=True, session=db.session)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(item)
            }
        except ValidationError as e:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': e.messages
            }, 400
        except IntegrityError as e:
            return {
                'status': 400,
                'error':
                'IntegrityError',
                'message': e.args
            }, 400


class Config(Resource):
    method_decorators = [jwt_required()]

    neededPostAccess = ['Configuration.Writer']
    neededGetAccess = ['Configuration.Reader']

    def get(self):
        checkAccess(get_jwt(), self.neededGetAccess)
        data = Configuration.query.all()
        schema = ConfigurationSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(data)
        }
