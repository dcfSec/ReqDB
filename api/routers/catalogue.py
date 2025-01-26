from typing import Annotated, Union
from fastapi import Depends, HTTPException, status
from sqlmodel import select

from api.routers import AuthRouter, getRoles, getUserId
from api.error import ConflictError, NotFound
from api.models.insert import Insert
from api.models.update import Update

from ..models import SessionDep, audit
from ..models.db import Catalogue, Topic
from ..models.response import (
    Response,
)

router = AuthRouter()


@router.get("/catalogues", status_code=status.HTTP_200_OK)
async def getCatalogues(
    session: SessionDep, expandRelationships: bool = True
) -> Union[Response.Catalogue, Response.CatalogueWithTopicsAndRequirements]:
    catalogues = session.exec(select(Catalogue)).all()

    if expandRelationships is False:
        return Response.Catalogue(status=200, data=catalogues)
    else:
        return Response.CatalogueWithTopicsAndRequirements(status=200, data=catalogues)


@router.get("/catalogues/{catalogueID}", status_code=status.HTTP_200_OK)
async def getCatalogue(
    roles: Annotated[dict, Depends(getRoles)],
    session: SessionDep,
    catalogueID: int,
    expandRelationships: bool = True,
) -> Union[
    Response.Catalogue,
    Response.CatalogueWithTopicsAndRequirements,
    Response.CatalogueWithTopicsAndRequirementsAndComments,
]:
    catalogue = session.get(Catalogue, catalogueID)

    if not catalogue:
        raise NotFound(status_code=404, detail="Catalogue not found")
    if expandRelationships is False:
        return Response.Catalogue(status=200, data=catalogue)
    else:
        if "Comments.Reader" in roles:
            return Response.CatalogueWithTopicsAndRequirementsAndComments(
                status=200, data=catalogue
            )
        return Response.CatalogueWithTopicsAndRequirements(status=200, data=catalogue)


@router.patch("/catalogues/{catalogueID}", status_code=status.HTTP_200_OK)
async def patchCatalogue(
    catalogue: Update.Catalogue,
    catalogueID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.CatalogueWithTopicsAndRequirements:
    catalogueFromDB = session.get(Catalogue, catalogueID)
    if not catalogueFromDB:
        raise NotFound(detail="Catalogue not found")
    catalogueData = catalogue.model_dump(exclude_unset=True, mode="python")
    catalogueFromDB.sqlmodel_update(catalogueData)
    catalogueFromDB.topics = []
    for topic in catalogueData["topics"]:
        t = session.get(Topic, topic["id"])
        if t:
            catalogueFromDB.topics.append(t)
        else:
            raise NotFound(detail=f"Child with ID {topic['id']} not found")
    session.add(catalogueFromDB)
    session.commit()
    session.refresh(catalogueFromDB)
    audit(session, 1, catalogueFromDB, userId)
    return {"status": 200, "data": catalogueFromDB}


@router.post("/catalogues", status_code=status.HTTP_201_CREATED)
async def addCatalogue(
    catalogue: Insert.Catalogue,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Catalogue:
    topics = catalogue.topics
    catalogue.topics = []
    catalogueDB = Catalogue.model_validate(catalogue)
    session.add(catalogueDB)
    for topic in topics:
        t = session.get(Topic, topic.id)
        if t:
            catalogueDB.topics.append(t)
        else:
            raise NotFound(detail=f"Child with ID {topic['id']} not found")
    session.commit()
    session.refresh(catalogueDB)
    audit(session, 0, catalogueDB, userId)
    return {"status": 201, "data": catalogueDB}


@router.delete("/catalogues/{catalogueID}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteCatalogue(
    catalogueID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
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
    session.commit()
    audit(session, 2, catalogue, userId)
    return None
