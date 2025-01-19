from os import path

from flask import Blueprint, Flask
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

from api.config import Config

Config.getOpenIdConfig()
Config.getJWKs()


class ReqDBApi(Api):
    def handle_error(self, e):
        return e.message, e.code

ma = Marshmallow()

app = Flask(__name__, static_url_path="", static_folder=path.abspath("front-end/dist"))
app.config.from_object(Config)

jwt = JWTManager(app)

db = SQLAlchemy(app)

configAPI_bp = Blueprint("configAPI", __name__, url_prefix="/api/config")
api_bp = Blueprint("api", __name__, url_prefix="/api")

api = ReqDBApi(api_bp)
configAPI = ReqDBApi(configAPI_bp)


@jwt.decode_key_loader
def getDecodeKey(header: dict, payload: dict):
    """
    Returns the correct decoding key for the jwt

    :param dict header: jwt header
    :param dict payload: jwt payload
    :raises KeyError: Returns if the key ID is not found in the dict
    :return str: Key in PEM format
    """
    if header["kid"] in Config.JWT_PUBLIC_KEY:
        return Config.JWT_PUBLIC_KEY[header["kid"]]
    else:
        Config.getJWKs()
        if header["kid"] in Config.JWT_PUBLIC_KEY:
            return Config.JWT_PUBLIC_KEY[header["kid"]]
        else:
            raise KeyError(f"kid {header['kid']} is not a supported key ID")
