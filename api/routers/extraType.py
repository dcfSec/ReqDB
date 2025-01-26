from typing import Annotated, Union
from fastapi import Depends, HTTPException, status
from sqlmodel import select

from api.routers import AuthRouter, getUserId
from api.error import ConflictError, NotFound
from api.models.insert import Insert
from api.models.update import Update

from ..models import SessionDep, audit
from ..models.db import ExtraType
from ..models.response import (
    Response,
)

router = AuthRouter()


@router.get("/extraTypes", status_code=status.HTTP_200_OK)
async def getExtraTypes(
    session: SessionDep, expandRelationships: bool = True
) -> Union[Response.ExtraType, Response.ExtraType]:
    extraTypes = session.exec(select(ExtraType)).all()

    if expandRelationships is False:
        return Response.ExtraType(status=200, data=extraTypes)
    else:
        return Response.ExtraType(status=200, data=extraTypes)


@router.get("/extraTypes/{extraTypeID}", status_code=status.HTTP_200_OK)
async def getExtraType(
    session: SessionDep, extraTypeID: int, expandRelationships: bool = True
) -> Union[Response.ExtraType, Response.ExtraType]:
    extraType = session.get(ExtraType, extraTypeID)

    if not extraType:
        raise NotFound(status_code=404, detail="ExtraType not found")
    if expandRelationships is False:
        return Response.ExtraType(status=200, data=extraType)
    else:
        return Response.ExtraType(status=200, data=extraType)


@router.patch("/extraTypes/{extraTypeID}", status_code=status.HTTP_200_OK)
async def patchExtraType(
    extraType: Update.ExtraType,
    extraTypeID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.ExtraType:
    extraTypeFromDB = session.get(ExtraType, extraTypeID)
    if not extraTypeFromDB:
        raise NotFound(detail="ExtraType not found")
    extraTypeData = extraType.model_dump(exclude_unset=True, mode="python")
    extraTypeFromDB.sqlmodel_update(extraTypeData)
    session.add(extraTypeFromDB)
    session.commit()
    session.refresh(extraTypeFromDB)
    audit(session, 1, extraTypeFromDB, userId)
    return {"status": 200, "data": extraTypeFromDB}


@router.post("/extraTypes", status_code=status.HTTP_201_CREATED)
def addExtraType(
    extraType: Insert.ExtraType,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.ExtraType:
    extraTypeDB = ExtraType.model_validate(extraType)
    session.add(extraTypeDB)
    session.commit()
    session.refresh(extraTypeDB)
    audit(session, 0, extraTypeDB, userId)
    return {"status": 201, "data": extraTypeDB}


@router.delete("/extraTypes/{extraTypeID}", status_code=status.HTTP_204_NO_CONTENT)
def deleteExtraType(
    extraTypeID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
    force: bool = False,
) -> None:
    extraType = session.get(ExtraType, extraTypeID)
    if not extraType:
        raise NotFound(detail="ExtraType not found")
    if len(extraType.children) > 0 and force is False:
        raise ConflictError(
            detail=[
                f"ExtraType has {len(extraType.children)} ExtraEntries.",
                "Use force and cascade (?force=true) to delete anyway.",
                "This will also delete the ExtraEntries.",
            ]
        )
    session.delete(extraType)
    session.commit()
    audit(session, 2, extraType, userId)
    return None
