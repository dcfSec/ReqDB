import time
from typing import Callable, Optional

from authlib.jose import JsonWebToken
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.routing import APIRoute
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from api.config import AppConfig
from api.error import AuthConfigMissing, Forbidden, Unauthorized
from api.helper import RequestTimer
from api.models import engine
from api.models.db import User

oauthParams = {
    "iss": {"essential": True, "values": [AppConfig.JWT_DECODE_ISSUER]},
    "sub": {"essential": True, "value": AppConfig.OAUTH_CLIENT_ID},
}


auth = {
    "getStaticConfig": {"required": False, "roles": []},
    "getConfig": {"required": True, "roles": []},
    "patchConfig": {"required": True, "roles": ["Configuration.Writer"]},
    "getTags": {"required": True, "roles": ["Requirements.Reader"]},
    "getTag": {"required": True, "roles": ["Requirements.Reader"]},
    "patchTag": {"required": True, "roles": ["Requirements.Writer"]},
    "addTag": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteTag": {"required": True, "roles": ["Requirements.Writer"]},
    "getCatalogues": {"required": True, "roles": ["Requirements.Reader"]},
    "getCatalogue": {"required": True, "roles": ["Requirements.Reader"]},
    "patchCatalogue": {"required": True, "roles": ["Requirements.Writer"]},
    "addCatalogue": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteCatalogue": {"required": True, "roles": ["Requirements.Writer"]},
    "getComments": {"required": True, "roles": ["Requirements.Reader"]},
    "getComment": {"required": True, "roles": ["Requirements.Reader"]},
    "patchComment": {"required": True, "roles": ["Requirements.Writer"]},
    "addComment": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteComment": {"required": True, "roles": ["Requirements.Writer"]},
    "getTopics": {"required": True, "roles": ["Requirements.Reader"]},
    "getTopic": {"required": True, "roles": ["Requirements.Reader"]},
    "patchTopic": {"required": True, "roles": ["Requirements.Writer"]},
    "addTopic": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteTopic": {"required": True, "roles": ["Requirements.Writer"]},
    "getRequirements": {"required": True, "roles": ["Requirements.Reader"]},
    "getRequirement": {"required": True, "roles": ["Requirements.Reader"]},
    "patchRequirement": {"required": True, "roles": ["Requirements.Writer"]},
    "addRequirement": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteRequirement": {"required": True, "roles": ["Requirements.Writer"]},
    "getExtraTypes": {"required": True, "roles": ["Requirements.Reader"]},
    "getExtraType": {"required": True, "roles": ["Requirements.Reader"]},
    "patchExtraType": {"required": True, "roles": ["Requirements.Writer"]},
    "addExtraType": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteExtraType": {"required": True, "roles": ["Requirements.Writer"]},
    "getExtraEntries": {"required": True, "roles": ["Requirements.Reader"]},
    "getExtraEntry": {"required": True, "roles": ["Requirements.Reader"]},
    "patchExtraEntry": {"required": True, "roles": ["Requirements.Writer"]},
    "addExtraEntry": {"required": True, "roles": ["Requirements.Writer"]},
    "deleteExtraEntry": {"required": True, "roles": ["Requirements.Writer"]},
    "getCoffee": {"required": True, "roles": ["Requirements.Reader"]},
}



class HTTPBearerWithUnauthorizedError(HTTPBearer):
    async def __call__(
        self, request: Request
    ) -> Optional[HTTPAuthorizationCredentials]:
        try:
            return await super().__call__(request)
        except HTTPException as e:
            raise Unauthorized(detail=e.detail)


class RBACRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def checkAccessRouteHandler(request: Request) -> Response:
            if request.scope["route"].name not in auth:
                raise AuthConfigMissing(
                    detail=f"Authentication configuration missing for route {request.scope['route'].name}"
                )
            if auth[request.scope["route"].name]["required"] is True:
                jwt = await validateJWT(
                    await HTTPBearerWithUnauthorizedError()(request)
                )
                await checkAccess(jwt, auth[request.scope["route"].name]["roles"])
            response = await original_route_handler(request)
            return response

        return checkAccessRouteHandler

class AuthRouter(APIRouter):
    def __init__(self, **kwargs):
        super().__init__(route_class=RBACRoute, **kwargs)


def getDecodeKey(header: dict, payload: dict):
    """
    Returns the correct decoding key for the jwt

    :param dict header: jwt header
    :param dict payload: jwt payload
    :raises KeyError: Returns if the key ID is not found in the dict
    :return str: Key in PEM format
    """
    try:
        return AppConfig.JWT_PUBLIC_KEYS.find_by_kid(header["kid"])
    except ValueError:
        AppConfig.getJWKs()
        try:
            return AppConfig.JWT_PUBLIC_KEYS.find_by_kid(header["kid"])
        except ValueError:
            raise KeyError(f"kid {header['kid']} is not a supported key ID")


async def validateJWT(
    credentials: HTTPAuthorizationCredentials,
):
    token = credentials.credentials
    jwt = JsonWebToken(["RS256"])
    try:
        claims = jwt.decode(token, getDecodeKey, claims_params=oauthParams)
    except Exception as e:
        raise Unauthorized(detail=str(e))
    
    with Session(engine) as session:
        user = session.get(User, claims["sub"])
        if not user:
            session.commit()
            session.add(User(id=claims["sub"], email=claims["email"]))
            session.commit()

    return claims


async def checkAccess(jwt: dict, neededRoles: list[str]):
    """
    Checks the access for a request. Checks if the jwt contains the needed roles.
    Aborts if the required roles are not met

    :param dict jwt: Dict with the JWT properties
    :param list neededRoles: List with the needed roles
    """
    if "roles" not in jwt or (
        len(neededRoles) > 0 and not (set(jwt["roles"]) & set(neededRoles))
    ):
        raise Forbidden(detail="Missing a needed role for this request.")


async def getRoles(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearerWithUnauthorizedError()),
):
    token = credentials.credentials
    jwt = JsonWebToken(["RS256"])
    try:
        claims = jwt.decode(token, getDecodeKey, claims_params=oauthParams)
    except Exception as e:
        raise Unauthorized(detail=str(e))
    return claims["roles"] if "roles" in claims else []


async def getUserId(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearerWithUnauthorizedError()),
):
    token = credentials.credentials
    jwt = JsonWebToken(["RS256"])
    try:
        claims = jwt.decode(token, getDecodeKey, claims_params=oauthParams)
    except Exception as e:
        raise Unauthorized(detail=str(e))
    return claims["sub"]