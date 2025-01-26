from typing import Annotated

from fastapi import Depends, status
from sqlmodel import select

from api.error import NotFound
from api.models import SessionDep, audit
from api.models.db import Comment
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get("/comments", status_code=status.HTTP_200_OK)
async def getComments(
    session: SessionDep
) -> Response.Comment:
    comments = session.exec(select(Comment)).all()

    return Response.Comment(status=200, data=comments)



@router.get("/comments/{commentID}", status_code=status.HTTP_200_OK)
async def getComment(
    session: SessionDep, commentID: int
) -> Response.Comment:
    comment = session.get(Comment, commentID)

    if not comment:
        raise NotFound(status_code=404, detail="Comment not found")
    
    return Response.Comment(status=200, data=comment)



@router.patch("/comments/{commentID}", status_code=status.HTTP_200_OK)
async def patchComment(
    comment: Update.Comment,
    commentID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> Response.Comment:
    commentFromDB = session.get(Comment, commentID)
    if not commentFromDB:
        raise NotFound(detail="Comment not found")
    commentData = comment.model_dump(exclude_unset=True, mode="python")
    commentFromDB.sqlmodel_update(commentData)
    session.add(commentFromDB)
    session.commit()
    session.refresh(commentFromDB)
    audit(session, 1, commentFromDB, userId)
    return {"status": 200, "data": commentFromDB}


@router.post("/comments", status_code=status.HTTP_201_CREATED)
async def addComment(
    userId: Annotated[dict, Depends(getUserId)], 
    comment: Insert.Comment,
    session: SessionDep,
) -> Response.Comment:
    comment.authorId = userId
    commentDB = Comment.model_validate(comment)
    session.add(commentDB)
    session.commit()
    session.refresh(commentDB)
    audit(session, 0, commentDB, userId)
    return {"status": 201, "data": commentDB}


@router.delete("/comments/{commentID}", status_code=status.HTTP_204_NO_CONTENT)
async def deleteComment(
    commentID: int,
    session: SessionDep,
    userId: Annotated[dict, Depends(getUserId)],
) -> None:
    comment = session.get(Comment, commentID)
    if not comment:
        raise NotFound(detail="Comment not found")
    session.delete(comment)
    session.commit()
    audit(session, 2, comment, userId)
    return None
