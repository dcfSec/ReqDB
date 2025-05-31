from typing import Annotated, Union

from fastapi import Depends, status
from sqlmodel import col, select

from api.error import NotFound, ErrorResponses
from api.models import SessionDep, audit
from api.models.db import ExtraEntry
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/extraEntries",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All extra entries"},
    },
)
async def getExtraEntries(
    session: SessionDep, expandTopics: bool = True
) -> Response.ExtraEntry.List:
    extraEntries = session.exec(select(ExtraEntry)).unique().all()

    if expandTopics is False:
        return Response.buildResponse(Response.ExtraEntry.List, extraEntries)  # type: ignore
    else:
        return Response.buildResponse(Response.ExtraEntry.List, extraEntries)  # type: ignore


@router.get(
    "/extraEntries/find",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All extra entries"},
    },
)
async def findExtraEntries(
    session: SessionDep, query: str, expandTopics: bool = True
) -> Response.ExtraEntry.List:
    extraEntries = (
        session.exec(select(ExtraEntry).where(col(ExtraEntry.content).contains(query)))
        .unique()
        .all()
    )

    if expandTopics is False:
        return Response.buildResponse(Response.ExtraEntry.List, extraEntries)  # type: ignore
    else:
        return Response.buildResponse(Response.ExtraEntry.List, extraEntries)  # type: ignore


@router.get(
    "/extraEntries/{extraTypeID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The selected extra entry"},
    },
)
async def getExtraEntry(
    session: SessionDep, extraTypeID: int, expandTopics: bool = True
) -> Union[Response.ExtraEntry.One, Response.ExtraEntry.One]:
    extraType = session.get(ExtraEntry, extraTypeID)

    if not extraType:
        raise NotFound(detail="ExtraEntry not found")
    if expandTopics is False:
        return Response.buildResponse(Response.ExtraEntry.One, extraType)  # type: ignore
    else:
        return Response.buildResponse(Response.ExtraEntry.One, extraType)  # type: ignore


@router.patch(
    "/extraEntries/{extraTypeID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated extra entry"},
    },
)
async def patchExtraEntry(
    extraType: Update.ExtraEntry,
    extraTypeID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.ExtraEntry.One:
    extraTypeFromDB = session.get(ExtraEntry, extraTypeID)
    if not extraTypeFromDB:
        raise NotFound(detail="ExtraEntry not found")
    extraTypeFromDB.sqlmodel_update(extraType.model_dump(exclude_unset=True))
    session.add(extraTypeFromDB)
    session.commit()
    session.refresh(extraTypeFromDB)
    audit(session, 1, extraTypeFromDB, userId)
    return Response.buildResponse(Response.ExtraEntry.One, extraTypeFromDB)  # type: ignore


@router.post(
    "/extraEntries",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new extra entry"},
    },
)
async def addExtraEntry(
    extraType: Insert.ExtraEntry,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.ExtraEntry.One:
    extraTypeDB = ExtraEntry.model_validate(extraType)
    session.add(extraTypeDB)
    session.commit()
    session.refresh(extraTypeDB)
    audit(session, 0, extraTypeDB, userId)
    return Response.buildResponse(Response.ExtraEntry.One, extraTypeDB, 201)  # type: ignore


@router.delete(
    "/extraEntries/{extraTypeID}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        204: {"description": "Nothing"},
    },
)
async def deleteExtraEntry(
    extraTypeID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> None:
    extraType = session.get(ExtraEntry, extraTypeID)
    if not extraType:
        raise NotFound(detail="ExtraEntry not found")
    session.delete(extraType)
    session.commit()
    audit(session, 2, extraType, userId)
    return None
