from typing import Annotated

from fastapi import Depends, status
from sqlmodel import select

from api.config import AppConfig
from api.error import NotFound
from api.models import SessionDep
from api.models.db import Configuration
from api.models.response import Response, ResponseUpdate
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get("/config/static", status_code=status.HTTP_200_OK)
async def getStaticConfig(
    session: SessionDep,
) -> Response.StaticConfiguration:
    homeTitle = session.get(Configuration, "HOME_TITLE")
    homeMOTDPre = session.get(Configuration, "HOME_MOTD_PRE")
    homeMOTDPost = session.get(Configuration, "HOME_MOTD_POST")

    return {
        "status": 200,
        "data": {
            "oauth": {
                "provider": AppConfig.JWT_PROVIDER,
                "authority": AppConfig.JWT_DECODE_ISSUER,
                "client_id": AppConfig.JWT_DECODE_AUDIENCE,
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
        },
    }


@router.get("/config", status_code=status.HTTP_200_OK)
async def getConfig(
    session: SessionDep,
) -> Response.Configuration:

    conf = session.exec(select(Configuration)).all()
    return {"status": 200, "data": conf}


@router.patch("/config/{configID}", status_code=status.HTTP_200_OK)
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
