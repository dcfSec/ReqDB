import base64
import datetime
import logging
import secrets

from authlib.integrations.requests_client import OAuth2Session
from authlib.integrations.starlette_client import OAuth, OAuthError
from authlib.integrations.starlette_client.apps import StarletteOAuth2App
from authlib.oauth2.rfc6749.wrappers import OAuth2Token
from cryptography.exceptions import InvalidTag
from fastapi import FastAPI, HTTPException, Request
from fastapi import Response as FastResponse
from fastapi import status
from fastapi.datastructures import URL
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.exc import DatabaseError
from sqlmodel import Session
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from api.config import AppConfig
from api.error import ErrorResponses, Unauthorized, raiseDBErrorReadable
from api.models import audit as dbAudit
from api.models import engine
from api.models.db import User
from api.models.response import Response
from auth.models import Token, UserInfo
from helper.cache import EncryptedRedisCache

logger: logging.Logger = logging.getLogger(__name__)


class AuthSession:
    sessionStore = EncryptedRedisCache()
    maxAge: int = sessionStore.maxAge

    def __init__(self) -> None:
        pass

    async def startSession(self, token: dict) -> str:
        sessionId: str = secrets.token_urlsafe(32)
        nonce: bytes = secrets.token_bytes(
            12
        )  # GCM mode needs 12 fresh bytes every time

        return await self.sessionStore.set(
            sessionId, Token.model_validate(token).model_dump_json()
        )

    async def getSession(
        self, signedSessionId: str
    ) -> tuple[str, Token] | tuple[None, None]:
        data: tuple[str, str] | tuple[None, None] = await self.sessionStore.get(
            signedSessionId
        )
        if data[0] and data[1]:
            return data[0], Token.model_validate_json(data[1])
        else:
            return None, None

    async def refreshSession(self, sessionId: str, newToken: dict) -> tuple[str, Token]:

        try:
            session: tuple[str, str] | tuple[None, None] = await self.sessionStore.get(
                sessionId
            )

            if not session[1]:
                raise HTTPException(500, "Error refreshing the given session")

            sessionToken: Token = Token.model_validate_json(session[1])
            sessionToken.id_token = newToken["id_token"]
            sessionToken.refresh_token = newToken["refresh_token"]
            sessionToken.access_token = newToken["access_token"]
            sessionToken.expires_at = newToken["expires_at"]

            newSessionId: str = secrets.token_urlsafe(32)
            signedNewSessionId: str = await self.sessionStore.set(
                newSessionId, sessionToken.model_dump_json()
            )
            await self.removeSession(sessionId)
            return signedNewSessionId, sessionToken
        except InvalidTag as error:
            logger.error(f"Can't decrypt session with ID: {sessionId}")
            raise HTTPException(500, "Error refreshing the given session")

    async def removeSession(self, sessionId: str) -> None:
        await self.sessionStore.delete(sessionId)


auth = FastAPI(title="ReqDB - Auth", docs_url=None, redoc_url=None, openapi_url=None)
auth.add_middleware(
    SessionMiddleware, secret_key=AppConfig.SESSION_SECRET_KEY  # , same_site="strict"
)

authSession = AuthSession()
oauth = OAuth()

oauth.register(
    name=AppConfig.OAUTH_PROVIDER,
    server_metadata_url=AppConfig.OAUTH_CONFIG,
    client_kwargs={"scope": AppConfig.OAUTH_SCOPE},
    client_id=AppConfig.OAUTH_CLIENT_ID,
    client_secret=AppConfig.OAUTH_CLIENT_SECRET,
)

oauthClient: StarletteOAuth2App = oauth._clients[AppConfig.OAUTH_PROVIDER]


async def parseCallback(request: Request, response: FastResponse) -> UserInfo:
    try:
        token: OAuth2Token = await oauthClient.authorize_access_token(request)
        userInfo: object | None = token.get("userinfo", None)
        if userInfo:
            response.set_cookie(
                key="ReqDBSession",
                value=await authSession.startSession(token),
                samesite="strict",
                max_age=authSession.maxAge,
                secure=True,
                httponly=True,
            )
            if isinstance(userInfo, dict):

                user: UserInfo = UserInfo.model_validate(
                    {
                        "sub": userInfo.get("sub"),
                        "email": userInfo.get("email"),
                        "roles": userInfo.get("roles", []),
                    }
                )

                with Session(engine) as session:
                    dbUser: User | None = session.get(User, user.sub)
                    if not dbUser:
                        try:
                            session.commit()
                        except DatabaseError as e:
                            raiseDBErrorReadable(e)
                        dbUser = User(id=user.sub, email=user.email)
                        session.add(dbUser)
                        try:
                            session.commit()
                        except DatabaseError as e:
                            raiseDBErrorReadable(e)
                        session.refresh(dbUser)
                        dbAudit(session, 0, dbUser, user.sub)
                    elif dbUser.email != user.email:
                        dbUser.email = user.email
                        session.add(dbUser)
                        try:
                            session.commit()
                        except DatabaseError as e:
                            raiseDBErrorReadable(e)
                        session.refresh(dbUser)
                        dbAudit(session, 1, dbUser, user.sub)

                return user
            else:
                raise Unauthorized(detail="No valid user found")
        else:
            raise Unauthorized(detail="No valid user found")
    except OAuthError as error:
        raise HTTPException(500, f"{error.error}: {error.description}")


@auth.get("/login")
async def login(request: Request, spa: bool = False):
    redirect_uri: URL = request.url_for("getCallback" if not spa else "getSPACallback")
    return await oauth._clients[AppConfig.OAUTH_PROVIDER].authorize_redirect(
        request,
        redirect_uri,
    )


@auth.get(
    "/callback",
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        202: {"description": "Successful authentication"},
        500: {"description": "OAuth Error"},
    },
)
async def getCallback(request: Request, response: FastResponse) -> UserInfo:
    return await parseCallback(request, response)


@auth.get(
    "/spaCallback",
    status_code=status.HTTP_200_OK,
    responses={
        202: {"description": "Successful authentication"},
        500: {"description": "OAuth Error"},
    },
)
async def getSPACallback(request: Request, response: FastResponse) -> RedirectResponse:
    callback: UserInfo = await parseCallback(request, response)
    redirect_uri = "/oauth/callback"
    return RedirectResponse(
        f"{redirect_uri}?data={base64.b64encode(callback.model_dump_json().encode()).decode()}",
        headers=response.headers,
    )


@auth.get(
    "/token",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.unauthorized,
        202: {"description": "An access token for the api"},
    },
)
async def getToken(request: Request, response: FastResponse):
    if "ReqDBSession" in request.cookies:
        sessionId, token = await authSession.getSession(request.cookies["ReqDBSession"])
        if sessionId and token:
            tokenExpireTimestamp: datetime.datetime = datetime.datetime.fromtimestamp(
                token.expires_at, datetime.timezone.utc
            )
            tokenMaxAgeNow: datetime.datetime = datetime.datetime.now(
                datetime.timezone.utc
            ) - datetime.timedelta(minutes=2)

            if tokenExpireTimestamp < tokenMaxAgeNow:
                oauthApp: StarletteOAuth2App = oauth._clients[AppConfig.OAUTH_PROVIDER]
                client: OAuth2Session = oauthApp._get_oauth_client()
                sessionId, token = await authSession.refreshSession(
                    sessionId,
                    await client.refresh_token(
                        AppConfig.OAUTH_TOKEN_ENDPOINT,
                        refresh_token=token.refresh_token,
                    ),
                )
                response.set_cookie(
                    key="ReqDBSession",
                    value=sessionId,
                    samesite="strict",
                    max_age=authSession.maxAge,
                    secure=True,
                    httponly=True,
                )
            return {
                "status": 200,
                "data": {
                    "access_token": token.access_token,
                    "expires_at": token.expires_at,
                    "email": token.userinfo.email,
                    "roles": token.userinfo.roles,
                },
            }
        else:
            raise Unauthorized(detail="No valid session")
    else:
        raise Unauthorized(detail="No valid session cookie provided")


@auth.get(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Successful logout"},
    },
)
async def logout(request: Request) -> None:
    if "ReqDBSession" in request.cookies:
        sessionId, token = await authSession.getSession(request.cookies["ReqDBSession"])
        if sessionId and token:
            await authSession.removeSession(sessionId)  # TODO: Send logout to IDP


@auth.exception_handler(HTTPException)
async def genericExceptionHandler(
    request: Request, exc: HTTPException
) -> Response.Error:
    """
    Exception handler for generic API exception

    :param Request request: The request that triggered the exception
    :param HTTPException exc: The raised exception
    :return Response.Error: API compliant JSON error message and HTTP status code
    """
    return JSONResponse(
        {"status": exc.status_code, "error": type(exc).__name__, "message": exc.detail},
        status_code=exc.status_code,
    )  # type: ignore


@auth.exception_handler(StarletteHTTPException)
async def starletteHTTPExceptionHandler(
    request: Request, exc: StarletteHTTPException
) -> Response.Error:
    """
    Exception handler for generic starlette HTTP exception

    :param Request request: The request that triggered the exception
    :param StarletteHTTPException exc: The raised exception
    :return Response.Error: API compliant JSON error message and HTTP status code
    """
    return JSONResponse(
        {"status": exc.status_code, "error": type(exc).__name__, "message": exc.detail},
        status_code=exc.status_code,
    )  # type: ignore


@auth.exception_handler(RequestValidationError)
async def requestValidationErrorHandler(
    request: Request, exc: RequestValidationError
) -> Response.Error:
    """
    Exception handler for validation errors

    :param Request request: The request that triggered the exception
    :param RequestValidationError exc: The raised validation error
    :return Response.Error: API compliant JSON error message and HTTP status code
    """
    return JSONResponse(
        {"status": 422, "error": type(exc).__name__, "message": exc.errors()},
        status_code=422,
    )  # type: ignore


@auth.exception_handler(Exception)
async def exceptionHandler(request: Request, exc: Exception) -> Response.Error:
    """
    Exception handler for generic python exception

    :param Request request: The request that triggered the exception
    :param Exception exc: The raised exception
    :return Response.Error: API compliant JSON error message and HTTP status code
    """
    return JSONResponse(
        {"status": 500, "error": type(exc).__name__, "message": str(exc)},
        status_code=500,
    )  # type: ignore
