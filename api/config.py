from os import getenv, path
from uuid import uuid4

from authlib.jose.rfc7517.key_set import KeySet
import requests
from authlib.jose import JsonWebKey

basedir = path.abspath(path.dirname(__file__))


class AppConfig:
    """
    Static configuration for the ReqDB.
    These configuration items are mostly set by environment variables and should not be changed on runtime.

    :raises AssertionError: Raises, if a required environment variable is not set
    :raises AssertionError: Raises, if OIDC config from the given url is incomplete
    :return AppConfig: Static configuration used by ReqDB
    """

    SESSION_SECRET_KEY = getenv("SESSION_SECRET_KEY", "")
    DATABASE_URI = (
        getenv("DATABASE_URI") or f"sqlite:///{path.join(basedir, 'app.sqlite')}"
    )

    OAUTH_CLIENT_ID = f"{getenv('OAUTH_CLIENT_ID')}"
    OAUTH_CLIENT_SECRET = getenv("OAUTH_CLIENT_SECRET", "")
    OAUTH_CONFIG = getenv("OAUTH_CONFIG", "")
    OAUTH_SCOPE = (
        getenv("OAUTH_SCOPE")
        or f"openid email offline_access {OAUTH_CLIENT_ID}/.default"
    )
    OAUTH_PROVIDER = f"{getenv('OAUTH_PROVIDER')}"
    OAUTH_TOKEN_ENDPOINT: str = ""

    JWT_ALGORITHM = "RS256"
    JWT_DECODE_ISSUER: str = ""
    JWT_PUBLIC_KEYS: KeySet
    JWT_JWK_URI: str = ""

    BASE_URL = f"{getenv('BASE_URL', 'http://localhost')}"

    EMAIL_ACTIVE = False
    EMAIL_HOST = f"{getenv('EMAIL_HOST', '')}"
    EMAIL_PORT = int(getenv("EMAIL_PORT", 587))
    EMAIL_USER = f"{getenv('EMAIL_USER', '')}"
    EMAIL_PASSWORD = f"{getenv('EMAIL_PASSWORD', '')}"
    EMAIL_FROM = f"{getenv('EMAIL_FROM', '')}"
    EMAIL_TLS = bool(getenv("EMAIL_TLS", 1))
    EMAIL_SEND_SELF = bool(getenv("EMAIL_SEND_SELF", 0))

    @classmethod
    def getJWKs(cls):
        """
        Returns the jwt signing keys from the authorities jwk list as dictionary
        with kid -> pem

        :return dict: Dict with kid: pem
        """
        r = {}
        response: requests.Response = requests.get(AppConfig.JWT_JWK_URI)
        response.raise_for_status()
        cls.JWT_PUBLIC_KEYS: KeySet = JsonWebKey.import_key_set(response.json()["keys"])

    @classmethod
    def getOpenIdConfig(cls):
        """
        Fetches the oidc config from the provided config URL and sets the issuer and the jwk URI

        :raises AssertionError: Raises if "issuer" or "jwks_uri" are not present in the config
        :raises HTTPError: Raises if the HTTP status is not ok
        :raises requests.exceptions.JSONDecodeError: Raises if oauth config can't be decoded as json
        """
        response = requests.get(cls.OAUTH_CONFIG)
        response.raise_for_status()
        openIdConfig = response.json()

        for k in ["issuer", "jwks_uri", "token_endpoint"]:
            if k not in openIdConfig:
                raise AssertionError(f"Required key missing in oidc config URL: {k}")

        cls.JWT_DECODE_ISSUER = openIdConfig["issuer"]
        cls.JWT_JWK_URI = openIdConfig["jwks_uri"]
        cls.OAUTH_TOKEN_ENDPOINT = openIdConfig["token_endpoint"]

    @classmethod
    def setEmailActiveStatus(cls):
        """
        Checks if the email host and the from address is set and set EMAIL_ACTIVE to indicate that the app should be able to send emails.
        """
        if cls.EMAIL_HOST != "" and cls.EMAIL_FROM != "":
            cls.EMAIL_ACTIVE = True

    @classmethod
    def checkNeededEnvVariables(cls):
        """
        Checks if all needed environment variables are set. At the moment only the oauth configuration is needed

        :raises AssertionError: Raises, if the needed environment variables are missing
        """
        for k in [
            "OAUTH_CLIENT_ID",
            "OAUTH_CONFIG",
            "OAUTH_PROVIDER",
            "OAUTH_CLIENT_SECRET",
            "SESSION_SECRET_KEY",
        ]:
            if getenv(k) is None:
                raise AssertionError(f"Required env variable missing: {k}")

    @classmethod
    def getDynamicConfig(cls) -> dict:
        """
        The dynamic configuration variables of ReqDB.
        This will be loaded into the set DB and checked on application start.
        This configuration can be set via the API or UI


        :return dict: The dynamic configuration
        """

        return {
            "HOME_TITLE": {
                "value": "Welcome to ReqDB",
                "description": "The title for the start and login page",
                "type": "string",
                "category": "static",
            },
            "HOME_MOTD_PRE": {
                "value": "",
                "description": "A text field before the buttons on the home page. Markdown is supported.",
                "type": "text",
                "category": "static",
            },
            "HOME_MOTD_POST": {
                "value": "",
                "description": "A text field after the buttons on the home page. Markdown is supported,",
                "type": "text",
                "category": "static",
            },
            "LOGIN_MOTD_PRE": {
                "value": "",
                "description": "A text field before the buttons on the login page. Markdown is supported.",
                "type": "text",
                "category": "static",
            },
            "LOGIN_MOTD_POST": {
                "value": "",
                "description": "A text field after the buttons on the home page. Markdown is supported.",
                "type": "text",
                "category": "static",
            },
            "SOFT_DELETE": {
                "value": "false",
                "description": "If enabled items are not deleted from the database and only marked as deleted. (NOT IMPLEMENTED. ONLY PLACEHOLDER)",
                "type": "boolean",
                "category": "behavior",
            },
            "JIRA_ACTIVE": {
                "value": "false",
                "description": "Activates export support for Jira.",
                "type": "boolean",
                "category": "jira",
            },
            "JIRA_URL": {
                "value": "",
                "description": "URL for the used Jira instance",
                "type": "string",
                "category": "jira",
            },
            "JIRA_STORE_API_KEYS": {
                "value": "false",
                "description": "Activates the possibility to store Jira API-Keys for the user",
                "type": "boolean",
                "category": "jira",
            },
        }
