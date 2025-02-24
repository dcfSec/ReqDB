from typing import Annotated, Union

from fastapi import Depends, status
from sqlmodel import select

from api.error import ConflictError, NotFound, ErrorResponses
from api.models import SessionDep, audit
from api.models.db import ExtraType
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/extraTypes",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All extra types"},
    },
)
async def getExtraTypes(
    session: SessionDep, expandRelationships: bool = True
) -> Response.ExtraTypes:
    extraTypes = session.exec(select(ExtraType)).unique().all()

    if expandRelationships is False:
        return Response.buildResponse(Response.ExtraTypes, extraTypes)
    else:
        return Response.buildResponse(Response.ExtraTypes, extraTypes)


@router.get(
    "/extraTypes/{extraTypeID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The selected extra type"},
    },
)
async def getExtraType(
    session: SessionDep, extraTypeID: int, expandRelationships: bool = True
) -> Union[Response.ExtraType, Response.ExtraType]:
    extraType = session.get(ExtraType, extraTypeID)

    if not extraType:
        raise NotFound(status_code=404, detail="ExtraType not found")
    if expandRelationships is False:
        return Response.buildResponse(Response.ExtraType, extraType)
    else:
        return Response.buildResponse(Response.ExtraType, extraType)


@router.patch(
    "/extraTypes/{extraTypeID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated extra type"},
    },
)
async def patchExtraType(
    extraType: Update.ExtraType,
    extraTypeID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
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
    return Response.buildResponse(Response.ExtraType, extraTypeFromDB)


@router.post(
    "/extraTypes",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new extra type"},
    },
)
async def addExtraType(
    extraType: Insert.ExtraType,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.ExtraType:
    extraTypeDB = ExtraType.model_validate(extraType)
    session.add(extraTypeDB)
    session.commit()
    session.refresh(extraTypeDB)
    audit(session, 0, extraTypeDB, userId)
    return Response.buildResponse(Response.ExtraType, extraTypeDB, 201)


@router.delete(
    "/extraTypes/{extraTypeID}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        **ErrorResponses.conflict,
        204: {"description": "Nothing"},
    },
)
async def deleteExtraType(
    extraTypeID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
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
