from typing import Annotated, Union

from fastapi import Depends, status
from sqlmodel import select

from api.error import ConflictError, NotFound, ErrorResponses
from api.models import SessionDep, audit
from api.models.db import Catalogue, Requirement, Tag
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
    session: SessionDep, expandTopics: bool = True
) -> Union[Response.Tags, Response.TagsWithRequirements]:
    tags = session.exec(select(Tag)).unique().all()

    if expandTopics is False:
        return Response.buildResponse(Response.Tags, tags)
    else:
        return Response.buildResponse(Response.TagsWithRequirements, tags)


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
    session: SessionDep, tagID: int, expandTopics: bool = True
) -> Union[Response.Tag, Response.TagWithRequirementsAndCatalogues]:
    tag = session.get(Tag, tagID)

    if not tag:
        raise NotFound(detail="Tag not found")
    if expandTopics is False:
        return Response.buildResponse(Response.Tag, tag)
    else:
        return Response.buildResponse(Response.TagWithRequirementsAndCatalogues, tag)


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
    userId: Annotated[str, Depends(getUserId)],
) -> Response.TagWithRequirementsAndCatalogues:
    tagFromDB = session.get(Tag, tagID)
    if not tagFromDB:
        raise NotFound(detail="Tag not found")
    tagData = tag.model_dump(exclude_unset=True, mode="python")
    tagFromDB.sqlmodel_update(tagData)
    tagFromDB.requirements = []
    for requirement in tagData["requirements"]:
        t = session.get(Requirement, requirement["id"])
        if t:
            tagFromDB.requirements.append(t)
        else:
            raise NotFound(detail=f"Requirement with ID {requirement['id']} not found")
    tagFromDB.catalogues = []
    for catalogue in tagData["catalogues"]:
        t = session.get(Catalogue, catalogue["id"])
        if t:
            tagFromDB.catalogues.append(t)
        else:
            raise NotFound(detail=f"Catalogue with ID {catalogue['id']} not found")
    session.add(tagFromDB)
    session.commit()
    session.refresh(tagFromDB)
    audit(session, 1, tagFromDB, userId)
    return Response.buildResponse(Response.TagWithRequirementsAndCatalogues, tagFromDB)


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
    userId: Annotated[str, Depends(getUserId)],
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
    userId: Annotated[str, Depends(getUserId)],
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
