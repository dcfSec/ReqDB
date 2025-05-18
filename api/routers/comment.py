from typing import Annotated

from fastapi import BackgroundTasks, Depends, status
from sqlmodel import select

from api.error import ConflictError, NotFound, ErrorResponses
from api.helper import sendNotificationMailForNewComment
from api.models import SessionDep, audit
from api.models.db import Comment
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/comments",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All comments"},
    },
)
async def getComments(session: SessionDep) -> Response.Comment.List:
    comments = session.exec(select(Comment)).unique().all()

    return Response.buildResponse(Response.Comment.List, comments) # type: ignore


@router.get(
    "/comments/{commentID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "the selected comment"},
    },
)
async def getComment(session: SessionDep, commentID: int) -> Response.Comment.One:
    comment = session.get(Comment, commentID)

    if not comment:
        raise NotFound(detail="Comment not found")

    return Response.buildResponse(Response.Comment.One, comment) # type: ignore


@router.patch(
    "/comments/{commentID}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "The updated comment"},
    },
)
async def patchComment(
    comment: Update.Comment,
    commentID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Comment.One:
    commentFromDB = session.get(Comment, commentID)
    if not commentFromDB:
        raise NotFound(detail="Comment not found")
    commentFromDB.sqlmodel_update(comment.model_dump(exclude_unset=True))
    session.add(commentFromDB)
    session.commit()
    session.refresh(commentFromDB)
    audit(session, 1, commentFromDB, userId)
    return Response.buildResponse(Response.Comment.One, commentFromDB) # type: ignore


@router.post(
    "/comments",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        201: {"description": "The new comment"},
    },
)
async def addComment(
    userId: Annotated[str, Depends(getUserId)],
    comment: Insert.Comment,
    session: SessionDep,
    backgroundTasks: BackgroundTasks
) -> Response.Comment.One:
    comment.authorId = userId
    commentDB = Comment.model_validate(comment)
    session.add(commentDB)
    session.commit()
    session.refresh(commentDB)
    audit(session, 0, commentDB, userId)
    #sendNotificationMailForNewComment(session, commentDB.id)
    backgroundTasks.add_task(sendNotificationMailForNewComment, session, commentDB.id)
    return Response.buildResponse(Response.Comment.One, commentDB, 201) # type: ignore


@router.delete(
    "/comments/{commentID}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        204: {"description": "Nothing"},
    },
)
async def deleteComment(
    commentID: int,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
    force: bool = False,
) -> None:
    comment = session.get(Comment, commentID)
    if not comment:
        raise NotFound(detail="Comment not found")
    if len(comment.children) > 0 and force is False:
        raise ConflictError(
            detail=[
                f"Comment has {len(comment.children)} {'child' if len(comment.children) == 1 else 'children' }.",
                "Use force and cascade (?force=true) to delete anyway.",
                "This will also delete the extras.",
            ]
        )
    session.delete(comment)
    session.commit()
    audit(session, 2, comment, userId)
    return None
