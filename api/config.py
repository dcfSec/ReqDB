import json
from os import getenv, path

import jwt
import requests
from cryptography.hazmat.primitives import serialization

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

basedir = path.abspath(path.dirname(__file__))

for k in ["OAUTH_CLIENT_ID", "OAUTH_CONFIG", "OAUTH_PROVIDER"]:
    if getenv(k) is None:
        raise AssertionError(f"Required env variable missing: {k}")


class Config:
    SECRET_KEY = getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = (
        getenv("DATABASE_URI") or f"sqlite:///{path.join(basedir, 'app.sqlite')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ERROR_MESSAGE_KEY = "error"
    JWT_ALGORITHM = "RS256"
    JWT_PROVIDER = f"{getenv('OAUTH_PROVIDER')}"
    JWT_DECODE_AUDIENCE = f"{getenv('OAUTH_CLIENT_ID')}"
    JWT_DECODE_ISSUER = ""
    JWT_PUBLIC_KEY = ""
    JWT_JWK_URI = ""
    JWT_AUTHORITY = ""

    EMAIL_HOST = ""
    EMAIL_USER = ""
    EMAIL_PASSWORD = ""
    EMAIL_FROM = ""

    @classmethod
    def getJWKs(cls):
        """
        Returns the jwt signing keys from the authorities jwk list as dictionary
        with kid -> pem

        :return dict: Dict with kid: pem
        """
        r = {}
        response = requests.get(Config.JWT_JWK_URI)
        response.raise_for_status()
        keys = response.json()["keys"]
        for key in keys:
            rsa_pem_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
            rsa_pem_key_bytes = rsa_pem_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            )
            r[key["kid"]] = rsa_pem_key_bytes
        cls.JWT_PUBLIC_KEY = r

    @classmethod
    def getOpenIdConfig(cls):
        """
        Fetches the oidc config from the provided config URL and sets the issuer and the jwk URI

        :raises AssertionError: Raises if "issuer" or "jwks_uri" are not present in the config
        :raises HTTPError: Raises if the HTTP status is not ok
        :raises requests.exceptions.JSONDecodeError: Raises if oauth config can't be decoded as json
        """
        response = requests.get(f"{getenv('OAUTH_CONFIG')}")
        response.raise_for_status()
        openIdConfig = response.json()

        for k in ["issuer", "jwks_uri"]:
            if k not in openIdConfig:
                raise AssertionError(f"Required key missing in oidc config URL: {k}")

        cls.JWT_DECODE_ISSUER = openIdConfig["issuer"]
        cls.JWT_JWK_URI = openIdConfig["jwks_uri"]


dynamicConfig = {
    "HOME_TITLE": {
        "value": "Welcome to ReqDB",
        "description": "",
        "type": "string",
        "category": "static",
    },
    "HOME_MOTD_PRE": {
        "value": "",
        "description": "",
        "type": "text",
        "category": "static",
    },
    "HOME_MOTD_POST": {
        "value": "",
        "description": "",
        "type": "text",
        "category": "static",
    },
    "SOFT_DELETE": {
        "value": "false",
        "description": "",
        "type": "boolean",
        "category": "behavior",
    },
    "JIRA_ACTIVE": {
        "value": "false",
        "description": "",
        "type": "boolean",
        "category": "jira",
    },
    "JIRA_URL": {"value": "", "description": "", "type": "string", "category": "jira"},
    "JIRA_STORE_API_KEYS": {
        "value": "false",
        "description": "",
        "type": "boolean",
        "category": "jira",
    },
}
