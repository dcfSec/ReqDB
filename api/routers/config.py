from typing import Annotated

from fastapi import Depends, status
from sqlmodel import select

from api.config import AppConfig
from api.error import NotFound, ErrorResponses
from api.models import SessionDep
from api.models.db import Configuration, User
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/config/static",
    status_code=status.HTTP_200_OK,
    responses={
        200: {"description": "The static config"},
    },
)
async def getStaticConfig(
    session: SessionDep,
) -> Response.Configuration.Static:
    homeTitle = session.get(Configuration, "HOME_TITLE")
    homeMOTDPre = session.get(Configuration, "HOME_MOTD_PRE")
    homeMOTDPost = session.get(Configuration, "HOME_MOTD_POST")
    loginMOTDPre = session.get(Configuration, "LOGIN_MOTD_PRE")
    loginMOTDPost = session.get(Configuration, "LOGIN_MOTD_POST")

    return Response.buildResponse(
        Response.Configuration.Static,
        {
            "oauth": {
                "provider": AppConfig.OAUTH_PROVIDER,
                "authority": AppConfig.JWT_DECODE_ISSUER,
                "client_id": AppConfig.OAUTH_CLIENT_ID,
                "scope": AppConfig.OAUTH_SCOPE,
            },
            "home": {
                "title": (
                    homeTitle.value
                    if homeTitle and homeTitle.value != ""
                    else "Welcome to ReqDB"
                ),
                "MOTD": {
                    "pre": homeMOTDPre.value if homeMOTDPre else "",
                    "post": homeMOTDPost.value if homeMOTDPost else "",
                },
            },
            "login": {
                "MOTD": {
                    "pre": loginMOTDPre.value if loginMOTDPre else "",
                    "post": loginMOTDPost.value if loginMOTDPost else "",
                },
            },
        }, # type: ignore
    ) # type: ignore


@router.get(
    "/config/system",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All dynamic config items"},
    },
)
async def getSystemConfig(
    session: SessionDep,
) -> Response.Configuration.Dynamic.List:

    conf = session.exec(select(Configuration)).unique().all()
    return Response.buildResponse(Response.Configuration.Dynamic.List, conf) # type: ignore


@router.patch(
    "/config/system/{configID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated config element"},
    },
)
async def patchSystemConfig(
    configuration: Update.Configuration,
    configID: str,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Configuration.Dynamic.One:
    configurationFromDB = session.get(Configuration, configID)
    if not configurationFromDB:
        raise NotFound(detail="Configuration item not found")
    configurationFromDB.sqlmodel_update(configuration.model_dump(exclude_unset=True))
    session.add(configurationFromDB)
    session.commit()
    session.refresh(configurationFromDB)
    # if configurationFromDB.type == "secret":
    #     configurationFromDB.value = "******"
    # audit(session, 1, configurationFromDB, userId)
    return Response.buildResponse(Response.Configuration.Dynamic.One, configurationFromDB) # type: ignore


@router.get(
    "/config/user",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "User configuration"},
    },
)
async def getUserConfig(
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.User:

    conf = session.get(User, userId)
    return Response.buildResponse(Response.User, conf) # type: ignore


@router.patch(
    "/config/user",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated config element"},
    },
)
async def patchUserConfig(
    configuration: Update.User,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.User:
    configurationFromDB = session.get(User, userId)
    if not configurationFromDB:
        raise NotFound(detail="Configuration item not found")
    configurationFromDB.sqlmodel_update(configuration.model_dump(exclude_unset=True))
    session.add(configurationFromDB)
    session.commit()
    session.refresh(configurationFromDB)
    return Response.buildResponse(Response.User, configurationFromDB) # type: ignore