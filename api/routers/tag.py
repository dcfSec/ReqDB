from typing import Annotated, Union

from fastapi import Depends, status
from sqlmodel import select

from api.error import ConflictError, NotFound, ErrorResponses
from api.models import SessionDep, audit
from api.models.db import Tag
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/tags",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All tags"},
    },
)
async def getTags(
    session: SessionDep, expandRelationships: bool = True
) -> Union[Response.Tag, Response.TagWithRequirements]:
    tags = session.exec(select(Tag)).unique().all()

    if expandRelationships is False:
        return Response.buildResponse(Response.Tag, tags)
    else:
        return Response.buildResponse(Response.TagWithRequirements, tags)


@router.get(
    "/tags/{tagID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The selected tag"},
    },
)
async def getTag(
    session: SessionDep, tagID: int, expandRelationships: bool = True
) -> Union[Response.Tag, Response.TagWithRequirements]:
    tag = session.get(Tag, tagID)

    if not tag:
        raise NotFound(detail="Tag not found")
    if expandRelationships is False:
        return Response.buildResponse(Response.Tag, tag)
    else:
        return Response.buildResponse(Response.TagWithRequirements, tag)


@router.patch(
    "/tags/{tagID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated tag"},
    },
)
async def patchTag(
    tag: Update.Tag,
    tagID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.TagWithRequirements:
    tagFromDB = session.get(Tag, tagID)
    if not tagFromDB:
        raise NotFound(detail="Tag not found")
    tagData = tag.model_dump(exclude_unset=True, mode="python")
    tagFromDB.sqlmodel_update(tagData)
    session.add(tagFromDB)
    session.commit()
    session.refresh(tagFromDB)
    audit(session, 1, tagFromDB, userId)
    return Response.buildResponse(Response.TagWithRequirements, tagFromDB)


@router.post(
    "/tags",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new tag"},
    },
)
async def addTag(
    tag: Insert.Tag,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Tag:
    tagDB = Tag.model_validate(tag)
    session.add(tagDB)
    session.commit()
    session.refresh(tagDB)
    audit(session, 0, tagDB, userId)
    return Response.buildResponse(Response.Tag, tagDB, 201)


@router.delete(
    "/tags/{tagID}",
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
async def deleteTag(
    tagID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
    force: bool = False,
) -> None:
    tag = session.get(Tag, tagID)
    if not tag:
        raise NotFound(detail="Tag not found")
    if len(tag.requirements) > 0 and force is False:
        raise ConflictError(
            detail=[
                "Catalogue has topics.",
                "Use force (?force=true) to delete anyway.",
            ]
        )
    session.delete(tag)
    session.commit()
    audit(session, 2, tag, userId)
    return None
