from typing import Annotated, Union

from fastapi import Depends, status
from sqlmodel import select

from api.error import ConflictError, NotFound
from api.models import SessionDep, audit
from api.models.db import Tag
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get("/tags", status_code=status.HTTP_200_OK)
async def getTags(
    session: SessionDep, expandRelationships: bool = True
) -> Union[Response.Tag, Response.TagWithRequirements]:
    tags = session.exec(select(Tag)).all()

    if expandRelationships is False:
        return Response.Tag(status=200, data=tags)
    else:
        return Response.TagWithRequirements(status=200, data=tags)


@router.get("/tags/{tagID}", status_code=status.HTTP_200_OK)
async def getTag(
    session: SessionDep, tagID: int, expandRelationships: bool = True
) -> Union[Response.Tag, Response.TagWithRequirements]:
    tag = session.get(Tag, tagID)

    if not tag:
        raise NotFound(status_code=404, detail="Tag not found")
    if expandRelationships is False:
        return Response.Tag(status=200, data=tag)
    else:
        return Response.TagWithRequirements(status=200, data=tag)


@router.patch("/tags/{tagID}", status_code=status.HTTP_200_OK)
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
    return {"status": 200, "data": tagFromDB}


@router.post("/tags", status_code=status.HTTP_201_CREATED)
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
    return {"status": 201, "data": tagDB}


@router.delete("/tags/{tagID}", status_code=status.HTTP_204_NO_CONTENT)
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
