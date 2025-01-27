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
    session: SessionDep, expandRelationships: bool = False
) -> Union[Response.Topic, Response.TopicWithRequirements]:
    topics = session.exec(select(Topic)).all()

    if expandRelationships is False:
        return Response.Topic(status=200, data=topics)
    else:
        return Response.TopicWithRequirements(status=200, data=topics)


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
    session: SessionDep, topicID: int, expandRelationships: bool = False
) -> Union[Response.Topic, Response.TopicWithRequirements]:
    topic = session.get(Topic, topicID)

    if not topic:
        raise NotFound(detail="Topic not found")
    if expandRelationships is False:
        return Response.Topic(status=200, data=topic)
    else:
        return Response.TopicWithRequirements(status=200, data=topic)


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
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Topic:
    topicFromDB = session.get(Topic, topicID)
    if not topicFromDB:
        raise NotFound(detail="Topic not found")
    topicData = topic.model_dump(exclude_unset=True, mode="python")
    checkParentTopicChildren(topic.parentId, session, True)
    topicFromDB.sqlmodel_update(topicData)
    session.add(topicFromDB)
    session.commit()
    session.refresh(topicFromDB)
    audit(session, 1, topicFromDB, userId)
    return {"status": 200, "data": topicFromDB}


@router.post(
    "/topics",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The new topic"},
    },
)
async def addTopic(
    topic: Insert.Topic,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Topic:
    topicDB = Topic.model_validate(topic)
    checkParentTopicChildren(topic.parentId, session, True)
    session.add(topicDB)
    session.commit()
    session.refresh(topicDB)
    audit(session, 0, topicDB, userId)
    return {"status": 201, "data": topicDB}


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
    userId: Annotated[dict, Depends(getUserId)],
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
