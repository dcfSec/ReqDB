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


class Config:
    SECRET_KEY = getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = getenv('DATABASE_URI')\
        or f"sqlite:///{path.join(basedir, 'app.sqlite')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ERROR_MESSAGE_KEY = 'error'
    JWT_ALGORITHM = 'RS256'
    JWT_DECODE_AUDIENCE = f"{getenv('OAUTH_APP_CLIENT_ID')}"
    JWT_DECODE_ISSUER = ""
    JWT_PUBLIC_KEY = ""
    JWT_JWK_URI = ""

    @classmethod
    def getJWKs(cls):
        """Returns the jwt signing keys from the microsoft jwk list as dictionary
        with kid -> pem

        :return dict: Dict with kid: pem
        """
        r = {}
        response = requests.get(Config.JWT_JWK_URI)
        response.raise_for_status()
        keys = response.json()['keys']
        for key in keys:
            rsa_pem_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
            rsa_pem_key_bytes = rsa_pem_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            r[key["kid"]] = rsa_pem_key_bytes
        cls.JWT_PUBLIC_KEY = r

    @classmethod
    def getOpenIdConfig(cls):
        response = requests.get(f"{getenv('OAUTH_APP_AUTHORITY')}/.well-known/openid-configuration")
        response.raise_for_status()
        openIdConfig = response.json()

        cls.JWT_DECODE_ISSUER = openIdConfig["issuer"]
        cls.JWT_JWK_URI = openIdConfig["jwks_uri"]


