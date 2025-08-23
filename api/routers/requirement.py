from typing import Annotated

from fastapi import Depends, status
from sqlalchemy.exc import DatabaseError
from sqlmodel import col, or_, select

from api.error import ConflictError, ErrorResponses, NotFound, raiseDBErrorReadable
from api.helper import checkParentTopicChildren
from api.models import SessionDep, audit
from api.models.db import Requirement, Tag
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getRoles, getUserId

router = AuthRouter()


@router.get(
    "/requirements",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All requirements"},
    },
)
async def getRequirements(
    roles: Annotated[dict, Depends(getRoles)], session: SessionDep
) -> Response.Requirement.List | Response.Requirement.ListWithComments:
    requirements = session.exec(select(Requirement)).unique().all()

    if "Comments.Reader" in roles:
        return Response.buildResponse(Response.Requirement.ListWithComments, requirements)  # type: ignore
    else:
        return Response.buildResponse(Response.Requirement.List, requirements)  # type: ignore


@router.get(
    "/requirements/find",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All requirements"},
    },
)
async def findRequirements(
    roles: Annotated[dict, Depends(getRoles)], query: str, session: SessionDep
) -> Response.Requirement.List | Response.Requirement.ListWithComments:
    requirements = (
        session.exec(
            select(Requirement).where(
                or_(
                    col(Requirement.key).contains(query),
                    col(Requirement.title).contains(query),
                    col(Requirement.description).contains(query),
                )
            )
        )
        .unique()
        .all()
    )

    if "Comments.Reader" in roles:
        return Response.buildResponse(Response.Requirement.ListWithComments, requirements)  # type: ignore
    else:
        return Response.buildResponse(Response.Requirement.List, requirements)  # type: ignore


@router.get(
    "/requirements/{requirementID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The selected requirement"},
    },
)
async def getRequirement(
    roles: Annotated[dict, Depends(getRoles)], session: SessionDep, requirementID: int
) -> Response.Requirement.One | Response.Requirement.OneWithComments:
    requirement = session.get(Requirement, requirementID)

    if not requirement:
        raise NotFound(detail="Requirement not found")

    if "Comments.Reader" in roles:
        return Response.buildResponse(Response.Requirement.OneWithComments, requirement)  # type: ignore
    else:
        return Response.buildResponse(Response.Requirement.One, requirement)  # type: ignore


@router.patch(
    "/requirements/{requirementID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        **ErrorResponses.conflict,
        200: {"description": "The updated requirement"},
    },
)
async def patchRequirement(
    requirement: Update.Requirement,
    requirementID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Requirement.One:
    requirementFromDB = session.get(Requirement, requirementID)
    if not requirementFromDB:
        raise NotFound(detail="Requirement not found")
    requirementFromDB.sqlmodel_update(requirement.model_dump(exclude_unset=True))
    checkParentTopicChildren(requirementFromDB.parentId, session, False)
    requirementFromDB.tags = []
    tags = requirement.tags or []
    for tag in tags:
        t = session.get(Tag, tag.id)
        if t:
            requirementFromDB.tags.append(t)
        else:
            raise NotFound(detail=f"Tag with ID {tag.id} not found")
    session.add(requirementFromDB)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    session.refresh(requirementFromDB)
    audit(session, 1, requirementFromDB, userId)
    return Response.buildResponse(Response.Requirement.One, requirementFromDB)  # type: ignore


@router.post(
    "/requirements",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new requirement"},
    },
)
async def addRequirement(
    requirement: Insert.Requirement,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Requirement.One:
    tags = requirement.tags
    requirement.tags = []
    requirementDB = Requirement.model_validate(requirement)
    checkParentTopicChildren(requirement.parentId, session, False)
    requirementDB.tags = []
    for tag in tags:
        t = session.get(Tag, tag.id)
        if t:
            requirementDB.tags.append(t)
        else:
            raise NotFound(detail=f"Tag with ID {tag.id} not found")
    session.add(requirementDB)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    session.refresh(requirementDB)
    audit(session, 0, requirementDB, userId)
    return Response.buildResponse(Response.Requirement.One, requirementDB, 201)  # type: ignore


@router.delete(
    "/requirements/{requirementID}",
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
async def deleteRequirement(
    requirementID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
    force: bool = False,
) -> None:
    requirement = session.get(Requirement, requirementID)
    if not requirement:
        raise NotFound(detail="Requirement not found")
    if len(requirement.extras) > 0 and force is False:
        raise ConflictError(
            detail=[
                f"Requirement has {len(requirement.extras)} extra(s).",
                "Use force and cascade (?force=true) to delete anyway.",
                "This will also delete the extras.",
            ]
        )
    if len(requirement.comments) > 0 and force is False:
        raise ConflictError(
            detail=[
                f"Requirement has {len(requirement.comments)} comment(s).",
                "Use force and cascade (?force=true) to delete anyway.",
                "This will also delete the extras.",
            ]
        )
    session.delete(requirement)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    audit(session, 2, requirement, userId)
    return None
