from os import path

from flask import Flask, Blueprint
from flask_restful import Api

from flask_jwt_extended import JWTManager

from api.config import Config

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow


class ReqDBApi(Api):
    def handle_error(self, e):
        return e.message, e.code


db = SQLAlchemy()

ma = Marshmallow()

app = Flask(__name__, static_url_path='',
            static_folder=path.abspath('front-end/build'))
app.config.from_object(Config)

jwt = JWTManager(app)

db.init_app(app)

api_bp = Blueprint('api', __name__, url_prefix='/api')
api = ReqDBApi(api_bp)


@jwt.decode_key_loader
def getDecodeKey(header, payload):
    """Returns the correct decoding key for the jwt

    :param dict header: jwt header
    :param dict payload: jwt payload
    :raises KeyError: Returns if the key ID is not found in the dict
    :return str: Key in PEM format
    """
    if header['kid'] in Config.JWT_PUBLIC_KEY:
        return Config.JWT_PUBLIC_KEY[header['kid']]
    else:
        raise KeyError(f"kid {header['kid']} is not a supported key ID")
