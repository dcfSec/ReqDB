from os import getenv
from typing import Any

import requests
from joserfc.jwk import KeySet


class AppConfig:
    """
    Static configuration for the ReqDB.
    These configuration items are mostly set by environment variables and should not be changed on runtime.

    :raises AssertionError: Raises, if a required environment variable is not set
    :raises AssertionError: Raises, if OIDC config from the given url is incomplete
    :return AppConfig: Static configuration used by ReqDB
    """

    SESSION_SECRET_KEY: str = getenv("SESSION_SECRET_KEY", "")
    DATABASE_URI: str = getenv("DATABASE_URI", "sqlite:////tmp/ReqDB.sqlite')")

    OAUTH_CLIENT_ID: str = getenv("OAUTH_CLIENT_ID", "")
    OAUTH_CLIENT_SECRET: str = getenv("OAUTH_CLIENT_SECRET", "")
    OAUTH_CONFIG: str = getenv("OAUTH_CONFIG", "")
    OAUTH_SCOPE: str = getenv(
        "OAUTH_SCOPE", f"openid email offline_access {OAUTH_CLIENT_ID}/.default"
    )

    OAUTH_PROVIDER: str = getenv("OAUTH_PROVIDER", "")
    OAUTH_TOKEN_ENDPOINT: str = ""

    JWT_ALGORITHM = "RS256"
    JWT_DECODE_ISSUER: str = ""
    JWT_PUBLIC_KEYS: KeySet
    JWT_JWK_URI: str = ""

    BASE_URL: str = getenv("BASE_URL", "http://localhost")

    EMAIL_ACTIVE: bool = False
    EMAIL_HOST: str = getenv("EMAIL_HOST", "")
    EMAIL_PORT: int = int(getenv("EMAIL_PORT", 587))
    EMAIL_USER: str = getenv("EMAIL_USER", "")
    EMAIL_PASSWORD: str = getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: str = getenv("EMAIL_FROM", "")
    EMAIL_TLS: bool = bool(int(getenv("EMAIL_TLS", 1)))
    EMAIL_SEND_SELF: bool = bool(int(getenv("EMAIL_SEND_SELF", 0)))

    AUTH_FRONTEND_DEV_MODE: bool = bool(int(getenv("AUTH_FRONTEND_DEV_MODE", 0)))

    REDIS_HOST: str = getenv("REDIS_HOST", "")
    REDIS_PORT: int = int(getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD: str = getenv("REDIS_PASSWORD", "")
    REDIS_DB: str | int = getenv("REDIS_DB", 0)
    REDIS_TLS = bool(int(getenv("REDIS_TLS", 0)))

    LOGGING_CONFIG: dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "()": "uvicorn.logging.DefaultFormatter",
                "fmt": "[%(asctime)s.%(msecs)03d][%(levelname)s] %(name)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "access": {
                "()": "uvicorn.logging.AccessFormatter",
                "fmt": '[%(asctime)s.%(msecs)03d][%(levelname)s] %(name)s - %(client_addr)s - "%(request_line)s" %(status_code)s',
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stderr",
            },
            "access": {
                "formatter": "access",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout",
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["default"], "level": "INFO", "propagate": True},
            # "uvicorn.error": {"level": "INFO"},
            "uvicorn.access": {
                "handlers": ["access"],
                "level": "INFO",
                "propagate": False,
            },
            "watchfiles": {
                "handlers": ["default"],
                "level": "INFO",
            },
            "httpx": {"level": "ERROR"},
            "": {"handlers": ["default"], "level": "INFO", "propagate": True},
        },
    }

    @classmethod
    def getJWKs(cls) -> None:
        """
        Returns the jwt signing keys from the authorities jwk list as dictionary
        with kid -> pem

        :return dict: Dict with kid: pem
        """
        response: requests.Response = requests.get(AppConfig.JWT_JWK_URI)
        response.raise_for_status()
        cls.JWT_PUBLIC_KEYS: KeySet = KeySet.import_key_set(response.json())

    @classmethod
    def getOpenIdConfig(cls) -> None:
        """
        Fetches the oidc config from the provided config URL and sets the issuer and the jwk URI

        :raises AssertionError: Raises if "issuer" or "jwks_uri" are not present in the config
        :raises HTTPError: Raises if the HTTP status is not ok
        :raises requests.exceptions.JSONDecodeError: Raises if oauth config can't be decoded as json
        """
        response: requests.Response = requests.get(cls.OAUTH_CONFIG)
        response.raise_for_status()
        openIdConfig: dict = response.json()

        for k in ["issuer", "jwks_uri", "token_endpoint"]:
            if k not in openIdConfig:
                raise AssertionError(f"Required key missing in oidc config URL: {k}")

        cls.JWT_DECODE_ISSUER = openIdConfig["issuer"]
        cls.JWT_JWK_URI = openIdConfig["jwks_uri"]
        cls.OAUTH_TOKEN_ENDPOINT = openIdConfig["token_endpoint"]

    @classmethod
    def setEmailActiveStatus(cls) -> None:
        """
        Checks if the email host and the from address is set and set EMAIL_ACTIVE to indicate that the app should be able to send emails.
        """
        if cls.EMAIL_HOST != "" and cls.EMAIL_FROM != "":
            cls.EMAIL_ACTIVE = True

    @classmethod
    def checkNeededEnvVariables(cls) -> None:
        """
        Checks if all needed environment variables are set. At the moment only the oauth configuration is needed

        :raises AssertionError: Raises, if the needed environment variables are missing
        :raises AssertionError: Raises, if the needed environment variables has the default value (xxx)
        """
        for k in [
            "OAUTH_CLIENT_ID",
            "OAUTH_CONFIG",
            "OAUTH_PROVIDER",
            "OAUTH_CLIENT_SECRET",
            "SESSION_SECRET_KEY",
            "REDIS_HOST",
        ]:
            if getenv(k) is None:
                raise AssertionError(f"Required env variable missing: {k}")
            if getenv(k, "xxx").lower == "xxx":
                raise AssertionError(
                    f"Required env variable can't have the default value: {k}"
                )

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
