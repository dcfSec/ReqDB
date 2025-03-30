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
) -> Union[Response.Tag.List, Response.Tag.ListWithRequirements]:
    tags = session.exec(select(Tag)).unique().all()

    if expandTopics is False:
        return Response.buildResponse(Response.Tag.List, tags)
    else:
        return Response.buildResponse(Response.Tag.ListWithRequirements, tags)


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
) -> Union[Response.Tag.One, Response.Tag.OneWithRequirementsAndCatalogues]:
    tag = session.get(Tag, tagID)

    if not tag:
        raise NotFound(detail="Tag not found")
    if expandTopics is False:
        return Response.buildResponse(Response.Tag.One, tag)
    else:
        return Response.buildResponse(Response.Tag.OneWithRequirementsAndCatalogues, tag)


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
) -> Response.Tag.OneWithRequirementsAndCatalogues:
    tagFromDB = session.get(Tag, tagID)
    if not tagFromDB:
        raise NotFound(detail="Tag not found")
    tagFromDB.sqlmodel_update(tag.model_dump(exclude_unset=True))
    tagFromDB.requirements = []
    for requirement in tag.requirements:
        t = session.get(Requirement, requirement.id)
        if t:
            tagFromDB.requirements.append(t)
        else:
            raise NotFound(detail=f"Requirement with ID {requirement.id} not found")
    tagFromDB.catalogues = []
    for catalogue in tag.catalogues:
        t = session.get(Catalogue, catalogue.id)
        if t:
            tagFromDB.catalogues.append(t)
        else:
            raise NotFound(detail=f"Catalogue with ID {catalogue.id} not found")
    session.add(tagFromDB)
    session.commit()
    session.refresh(tagFromDB)
    audit(session, 1, tagFromDB, userId)
    return Response.buildResponse(Response.Tag.OneWithRequirementsAndCatalogues, tagFromDB)


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
) -> Response.Tag.OneWithRequirementsAndCatalogues:
    catalogues = tag.catalogues
    tag.catalogues = []
    requirement = tag.requirements
    tag.requirements = []
    tagDB = Tag.model_validate(tag)
    session.add(tagDB)
    for requirement in tag.requirements:
        t = session.get(Requirement, requirement.id)
        if t:
            tagDB.requirements.append(t)
        else:
            raise NotFound(detail=f"Requirement with ID {requirement.id} not found")
    for catalogue in catalogues:
        t = session.get(Catalogue, catalogue.id)
        if t:
            tagDB.catalogues.append(t)
        else:
            raise NotFound(detail=f"Catalogue with ID {catalogue.id} not found")
    session.commit()
    session.refresh(tagDB)
    audit(session, 0, tagDB, userId)
    return Response.buildResponse(Response.Tag.OneWithRequirementsAndCatalogues, tagDB, 201)


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
