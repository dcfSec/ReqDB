from typing import Annotated

from fastapi import Depends, status
from sqlalchemy.exc import DatabaseError
from sqlmodel import select

from api.error import ConflictError, ErrorResponses, NotFound, raiseDBErrorReadable
from api.models import SessionDep, audit
from api.models.db import User
from api.models.insert import Insert
from api.models.response import Response
from api.models.update import Update
from api.routers import AuthRouter, getUserId

router = AuthRouter()


@router.get(
    "/config/service/users",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        200: {"description": "All catalogues"},
    },
)
async def getServiceUsers(session: SessionDep) -> Response.User.List:
    serviceUsers = session.exec(select(User).where(User.service == True)).unique().all()

    return Response.buildResponse(Response.User.List, serviceUsers)  # type: ignore


@router.post(
    "/config/service/users",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Service user was created"},
    },
)
async def addServiceUser(
    session: SessionDep,
    service: Insert.ServiceUser,
) -> Response.User.One:
    service.service = True
    serviceDB: User = User.model_validate(service)
    session.add(serviceDB)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    session.refresh(serviceDB)
    audit(session, 0, serviceDB, service.id)
    return Response.buildResponse(Response.User.One, serviceDB)  # type: ignore


@router.patch(
    "/config/service/users/{id}",
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Service user was updated"},
    },
)
async def patchServiceUser(
    session: SessionDep,
    id: str,
    service: Update.ServiceUser,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.User.One:
    userFromDB: User | None = session.get(User, id)
    if not userFromDB or not userFromDB.service:
        raise NotFound(detail="Service user not found")
    userFromDB.sqlmodel_update(service.model_dump(exclude_unset=True))
    session.add(userFromDB)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    session.refresh(userFromDB)
    audit(session, 1, userFromDB, userId)
    return Response.buildResponse(Response.User.One, userFromDB)  # type: ignore


@router.delete(
    "/config/service/users/{id}",
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
async def deleteServiceUser(
    id: str,
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
) -> None:
    user: User | None = session.get(User, id)
    if not user or not user.service:
        raise NotFound(detail="Service user not found")
    if len(user.comments) > 0:
        raise ConflictError(
            detail=[
                f"Service user has {len(user.comments)} comment(s).",
                "Users with comments cannot be deleted.",
                "To deactivate access remove the roles in your IDP.",
            ]
        )
    session.delete(user)
    try:
        session.commit()
    except DatabaseError as e:
        raiseDBErrorReadable(e)
    audit(session, 2, user, userId)
    return None
