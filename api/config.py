from os import getenv, path
import json
import jwt
import requests
from cryptography.hazmat.primitives import serialization


try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

basedir = path.abspath(path.dirname(__file__))


def getAzureJWTKey():
    response = requests.get(
        "https://login.microsoftonline.com/common/discovery/keys"
    )
    keys = response.json()['keys']
    rsa_pem_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(keys[0]))
    rsa_pem_key_bytes = rsa_pem_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return rsa_pem_key_bytes


class Config:
    SECRET_KEY = getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = getenv('DATABASE_URI')\
        or f"sqlite:///{path.join(basedir, 'app.sqlite')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ERROR_MESSAGE_KEY = 'error'
    JWT_ALGORITHM = 'RS256'
    JWT_DECODE_AUDIENCE = f"api://{getenv('OAUTH_APP_CLIENT_ID')}"
    JWT_DECODE_ISSUER = \
        f"https://sts.windows.net/{getenv('OAUTH_APP_TENANT')}/"
    JWT_PUBLIC_KEY = getAzureJWTKey()
