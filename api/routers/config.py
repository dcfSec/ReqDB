from typing import Annotated

from fastapi import Depends, status
from sqlmodel import select

from api.config import AppConfig
from api.error import NotFound, ErrorResponses
from api.models import SessionDep
from api.models.db import Configuration
from api.models.response import Response, ResponseUpdate
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
) -> Response.StaticConfiguration:
    homeTitle = session.get(Configuration, "HOME_TITLE")
    homeMOTDPre = session.get(Configuration, "HOME_MOTD_PRE")
    homeMOTDPost = session.get(Configuration, "HOME_MOTD_POST")
    loginMOTDPre = session.get(Configuration, "LOGIN_MOTD_PRE")
    loginMOTDPost = session.get(Configuration, "LOGIN_MOTD_POST")

    return {
        "status": 200,
        "data": {
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
        },
    }


@router.get(
    "/config",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All dynamic config items"},
    },
)
async def getConfig(
    session: SessionDep,
) -> Response.Configuration:

    conf = session.exec(select(Configuration)).unique().all()
    return {"status": 200, "data": conf}


@router.patch(
    "/config/{configID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated config element"},
    },
)
async def patchConfig(
    configuration: Update.Configuration,
    configID: str,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> ResponseUpdate.Configuration:
    configurationFromDB = session.get(Configuration, configID)
    if not configurationFromDB:
        raise NotFound(detail="Configuration item not found")
    configurationData = configuration.model_dump(exclude_unset=True)
    configurationFromDB.sqlmodel_update(configurationData)
    session.add(configurationFromDB)
    session.commit()
    session.refresh(configurationFromDB)
    # if configurationFromDB.type == "secret":
    #     configurationFromDB.value = "******"
    # audit(session, 1, configurationFromDB, userId)
    return {"status": 200, "data": configurationFromDB}
