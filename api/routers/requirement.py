from typing import Annotated, Union
from fastapi import Depends, HTTPException, status
from sqlmodel import select

from api.helper import checkParentTopicChildren
from api.routers import AuthRouter, getUserId
from api.error import ConflictError, NotFound
from api.models.insert import Insert
from api.models.update import Update

from ..models import SessionDep, audit
from ..models.db import Requirement
from ..models.response import (
    Response,
)

router = AuthRouter()


@router.get("/requirements", status_code=status.HTTP_200_OK)
async def getRequirements(
    session: SessionDep, expandRelationships: bool = False
) -> Response.Requirement:
    requirements = session.exec(select(Requirement)).all()

    if expandRelationships is False:
        return Response.Requirement(status=200, data=requirements)
    else:
        return Response.Requirement(status=200, data=requirements)


@router.get("/requirements/{requirementID}", status_code=status.HTTP_200_OK)
async def getRequirement(
    session: SessionDep, requirementID: int, expandRelationships: bool = True
) -> Union[Response.Requirement, Response.Requirement]:
    requirement = session.get(Requirement, requirementID)

    if not requirement:
        raise NotFound(status_code=404, detail="Requirement not found")
    if expandRelationships is False:
        return Response.Requirement(status=200, data=requirement)
    else:
        return Response.Requirement(status=200, data=requirement)


@router.patch("/requirements/{requirementID}", status_code=status.HTTP_200_OK)
async def patchRequirement(
    requirement: Update.Requirement,
    requirementID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Requirement:
    requirementFromDB = session.get(Requirement, requirementID)
    if not requirementFromDB:
        raise NotFound(detail="Requirement not found")
    requirementData = requirement.model_dump(exclude_unset=True, mode="python")
    checkParentTopicChildren(requirement.parentId, session, False)
    requirementFromDB.sqlmodel_update(requirementData)
    session.add(requirementFromDB)
    session.commit()
    session.refresh(requirementFromDB)
    audit(session, 1, requirement, requirementFromDB)
    return {"status": 200, "data": requirementFromDB}


@router.post("/requirements", status_code=status.HTTP_201_CREATED)
def addRequirement(
    requirement: Insert.Requirement,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Requirement:
    requirementDB = Requirement.model_validate(requirement)
    checkParentTopicChildren(requirement.parentId, session, False)
    session.add(requirementDB)
    session.commit()
    session.refresh(requirementDB)
    audit(session, 0, requirementDB, userId)
    return {"status": 201, "data": requirementDB}


@router.delete("/requirements/{requirementID}", status_code=status.HTTP_204_NO_CONTENT)
def deleteRequirement(
    requirementID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
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
    session.commit()
    audit(session, 2, requirement, userId)
    return None
