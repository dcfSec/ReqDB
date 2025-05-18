from typing import Annotated, Union

from fastapi import Depends, status
from sqlmodel import select

from api.error import ConflictError, NotFound, ErrorResponses
from api.helper import checkParentTopicChildren
from api.models import SessionDep, audit
from api.models.db import Topic
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/topics",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All topics"},
    },
)
async def getTopics(
    session: SessionDep, expandTopics: bool = False
) -> Union[Response.Topic.List, Response.Topic.ListWithRequirements]:
    topics = session.exec(select(Topic)).unique().all()

    if expandTopics is False:
        return Response.buildResponse(Response.Topic.List, topics) # type: ignore
    else:
        return Response.buildResponse(Response.Topic.ListWithRequirements, topics) # type: ignore


@router.get(
    "/topics/{topicID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The selected topic"},
    },
)
async def getTopic(
    session: SessionDep, topicID: int, expandTopics: bool = False
) -> Union[Response.Topic.One, Response.Topic.OneWithRequirements]:
    topic = session.get(Topic, topicID)

    if not topic:
        raise NotFound(detail="Topic not found")
    if expandTopics is False:
        return Response.buildResponse(Response.Topic.One, topic) # type: ignore
    else:
        return Response.buildResponse(Response.Topic.OneWithRequirements, topic) # type: ignore


@router.patch(
    "/topics/{topicID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        **ErrorResponses.conflict,
        200: {"description": "The updated topic"},
    },
)
async def patchTopic(
    topic: Update.Topic,
    topicID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Topic.One:
    topicFromDB = session.get(Topic, topicID)
    if not topicFromDB:
        raise NotFound(detail="Topic not found")
    topicFromDB.sqlmodel_update(topic.model_dump(exclude_unset=True))
    session.add(topicFromDB)
    session.commit()
    session.refresh(topicFromDB)
    audit(session, 1, topicFromDB, userId)
    return Response.buildResponse(Response.Topic.One, topicFromDB) # type: ignore


@router.post(
    "/topics",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new topic"},
    },
)
async def addTopic(
    topic: Insert.Topic,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Topic.One:
    topicDB = Topic.model_validate(topic)
    checkParentTopicChildren(topic.parentId, session, True)
    session.add(topicDB)
    session.commit()
    session.refresh(topicDB)
    audit(session, 0, topicDB, userId)
    return Response.buildResponse(Response.Topic.One, topicDB, 201) # type: ignore


@router.delete(
    "/topics/{topicID}",
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
async def deleteTopic(
    topicID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
    force: bool = False,
    cascade: bool = False,
) -> None:
    topic = session.get(Topic, topicID)
    if not topic:
        raise NotFound(detail="Topic not found")
    if len(topic.children) > 0 and force is False:
        raise ConflictError(
            detail=[
                f"Topic has {len(topic.children)} children.",
                "Use force (?force=true) to delete anyway.",
            ]
        )
    if len(topic.requirements) > 0 and force is False and cascade is False:
        raise ConflictError(
            detail=[
                f"Topic has {len(topic.requirements)} requirement(s).",
                "Use force and cascade (?force=true&cascade=true) to delete anyway.",
                "This will also delete the requirement.",
            ]
        )
    session.delete(topic)
    session.commit()
    audit(session, 2, topic, userId)
    return None
