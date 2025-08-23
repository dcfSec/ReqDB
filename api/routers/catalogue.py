from typing import Annotated

from fastapi import Depends, status
from sqlalchemy.exc import DatabaseError
from sqlmodel import col, or_, select

from api.error import ConflictError, ErrorResponses, NotFound, raiseDBErrorReadable
from api.models import SessionDep, audit
from api.models.db import Catalogue, Tag, Topic
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getRoles, getUserId

router = AuthRouter()


@router.get(
    "/catalogues",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All catalogues"},
    },
)
async def getCatalogues(
    session: SessionDep, expandTopics: bool = True
) -> Response.Catalogue.ListWithTags | Response.Catalogue.ListWithTopicsAndRequirements:
    catalogues = session.exec(select(Catalogue)).unique().all()

    if expandTopics is False:
        return Response.buildResponse(Response.Catalogue.ListWithTags, catalogues)  # type: ignore
    else:
        return Response.buildResponse(Response.Catalogue.ListWithTopicsAndRequirements, catalogues)  # type: ignore


@router.get(
    "/catalogues/find",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All catalogues"},
    },
)
async def findCatalogues(
    session: SessionDep, query: str, expandTopics: bool = True
) -> Response.Catalogue.ListWithTags | Response.Catalogue.ListWithTopicsAndRequirements:
    catalogues = (
        session.exec(
            select(Catalogue).where(
                or_(
                    col(Catalogue.key).contains(query),
                    col(Catalogue.title).contains(query),
                )
            )
        )
        .unique()
        .all()
    )

    if expandTopics is False:
        return Response.buildResponse(Response.Catalogue.ListWithTags, catalogues)  # type: ignore
    else:
        return Response.buildResponse(Response.Catalogue.ListWithTopicsAndRequirements, catalogues)  # type: ignore


@router.get(
    "/catalogues/{catalogueID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The selected catalogue"},
    },
)
async def getCatalogue(
    roles: Annotated[dict, Depends(getRoles)],
    session: SessionDep,
    catalogueID: int,
    expandTopics: bool = True,
) -> (
    Response.Catalogue.OneWithTags
    | Response.Catalogue.OneWithTopicsAndRequirements
    | Response.Catalogue.OneWithTopicsAndRequirementsAndComments
):
    catalogue = session.get(Catalogue, catalogueID)

    if not catalogue:
        raise NotFound(detail="Catalogue not found")
    if expandTopics is False:
        return Response.buildResponse(Response.Catalogue.OneWithTags, catalogue)  # type: ignore
    else:
        if "Comments.Reader" in roles:
            return Response.buildResponse(Response.Catalogue.OneWithTopicsAndRequirementsAndComments, catalogue)  # type: ignore
        return Response.buildResponse(Response.Catalogue.OneWithTopicsAndRequirements, catalogue)  # type: ignore


@router.patch(
    "/catalogues/{catalogueID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated catalogue"},
    },
)
async def patchCatalogue(
    catalogue: Update.Catalogue,
    catalogueID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Catalogue.OneWithTopicsAndRequirements:
    catalogueFromDB = session.get(Catalogue, catalogueID)
    if not catalogueFromDB:
        raise NotFound(detail="Catalogue not found")
    catalogueFromDB.sqlmodel_update(catalogue.model_dump(exclude_unset=True))
    catalogueFromDB.topics = []
    topics = catalogue.topics or []
    for topic in topics:
        t = session.get(Topic, topic.id)
        if t:
            catalogueFromDB.topics.append(t)
        else:
            raise NotFound(detail=f"Child with ID {topic.id} not found")
    catalogueFromDB.tags = []
    tags = catalogue.tags or []
    for tag in tags:
        t = session.get(Tag, tag.id)
        if t:
            catalogueFromDB.tags.append(t)
        else:
            raise NotFound(detail=f"Tag with ID {tag.id} not found")
    session.add(catalogueFromDB)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    session.refresh(catalogueFromDB)
    audit(session, 1, catalogueFromDB, userId)
    return Response.buildResponse(Response.Catalogue.OneWithTopics, catalogueFromDB)  # type: ignore


@router.post(
    "/catalogues",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new catalogue"},
    },
)
async def addCatalogue(
    catalogue: Insert.Catalogue,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Catalogue.One:
    topics = catalogue.topics
    catalogue.topics = []
    tags = catalogue.tags
    catalogue.tags = []
    catalogueDB = Catalogue.model_validate(catalogue)
    session.add(catalogueDB)
    for topic in topics:
        t = session.get(Topic, topic.id)
        if t:
            catalogueDB.topics.append(t)
        else:
            raise NotFound(detail=f"Child with ID {topic.id} not found")
    for tag in tags:
        t = session.get(Tag, tag.id)
        if t:
            catalogueDB.tags.append(t)
        else:
            raise NotFound(detail=f"Child with ID {tag.id} not found")
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    session.refresh(catalogueDB)
    audit(session, 0, catalogueDB, userId)
    return Response.buildResponse(Response.Catalogue.One, catalogueDB, 201)  # type: ignore


@router.delete(
    "/catalogues/{catalogueID}",
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
async def deleteCatalogue(
    catalogueID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
    force: bool = False,
) -> None:
    catalogue = session.get(Catalogue, catalogueID)
    if not catalogue:
        raise NotFound(detail="Catalogue not found")
    if len(catalogue.topics) > 0 and force is False:
        raise ConflictError(
            detail=[
                f"Catalogue has {len(catalogue.topics)} topic(s).",
                "Use force (?force=true) to delete anyway.",
            ]
        )
    session.delete(catalogue)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    audit(session, 2, catalogue, userId)
    return None
