from typing import Annotated

from fastapi import Depends, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.exc import DatabaseError
from sqlmodel import Session
from starlette.responses import Response

from api.connectors.jira import Jira
from api.error import (
    ErrorResponses,
    InternalServerError,
    NotFound,
    Unauthorized,
    UnprocessableContent,
    raiseDBErrorReadable,
)
from api.models import SessionDep, engine
from api.models.db import Requirement, Token, User
from api.models.insert import Insert
from api.models.public import Export
from api.models.response import Response
from api.routers import AuthRouter, getRoles, getUserId

router = AuthRouter()

with Session(engine) as session:
    try:
        jira = Jira(session=session)
    except:
        jira = None


@router.get(
    "/export/jira/configuration",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.server,
        200: {"description": "The Atlassian configuration"},
    },
)
async def getJiraConfiguration(
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
    roles: Annotated[dict, Depends(getRoles)],
    request: Request,
) -> Response.Export.Jira.Configuration:
    request.scope["user"] = userId
    if jira:
        user: str = await jira.getUser(request)
        return Response.buildResponse(Response.Export.Jira.Configuration, Export.Jira.Configuration(tenant=jira.cloudId, enabled=True, user=user))  # type: ignore
    else:
        return Response.buildResponse(Response.Export.Jira.Configuration, Export.Jira.Configuration(tenant="", enabled=False, user=""))  # type: ignore


@router.get(
    "/export/jira/token",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.server,
        200: {"description": "A jira token to use the atlassian API"},
    },
)
async def getJiraToken(
    session: SessionDep,
    userId: Annotated[str, Depends(getUserId)],
    roles: Annotated[dict, Depends(getRoles)],
    request: Request,
) -> Response.Export.Jira.Token | None:
    request.scope["user"] = userId
    if jira:
        tokenDict: dict[str, str | int] | None = await jira.getActiveToken(request)
        if tokenDict:
            token = Export.Jira.Token(
                name="AtlassianID",
                token_type=str(tokenDict["token_type"]),
                access_token=str(tokenDict["access_token"]),
                expires_at=int(tokenDict["expires_at"]),
            )
            return Response.buildResponse(Response.Export.Jira.Token, token)  # type: ignore
        else:
            raise Unauthorized(detail="Atlassian token could not be fetched")
    else:
        raise InternalServerError(detail="Atlassian connection not configured")


@router.get(
    "/export/jira/login",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.server,
        200: {"description": "Redirection URL for atlassian login"},
    },
)
async def getJiraLogin(
    userId: Annotated[str, Depends(getUserId)], request: Request, browser: bool = False
) -> Response.Export.Jira.RedirectLocation:
    if jira:
        redirect: RedirectResponse = await jira.login(userId, request, browser)
        location: Export.Jira.RedirectLocation = (
            Export.Jira.RedirectLocation.model_validate(
                {"location": redirect.headers["location"]}
            )
        )

        return Response.buildResponse(Response.Export.Jira.RedirectLocation, location)  # type: ignore
    else:
        raise InternalServerError(detail="Atlassian connection not configured")


@router.get(
    "/export/jira/callback",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.server,
        200: {"description": "Returns a Jira token when successfully logged in"},
    },
)
async def getJiraCallback(
    request: Request,
) -> Response.Export.Jira.Token:
    if jira:
        token: Insert.Token | HTMLResponse = await jira.callback(request)
        # if request.cookies.get
        if isinstance(token, HTMLResponse):
            return token  # type: ignore
        return Response.buildResponse(Response.Export.Jira.Token, token)  # type: ignore
    else:
        raise InternalServerError(detail="Atlassian connection not configured")


@router.post(
    "/export/jira/connect",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.server,
        201: {"description": "Jira connection successful"},
    },
)
async def postJiraConnectUser(
    session: SessionDep, userId: Annotated[str, Depends(getUserId)], token: Insert.Token
) -> None:
    if jira:
        token.userId = userId
        user: User | None = session.get(User, userId)
        if user is None:
            raise Unauthorized(detail="User ID not found")

        tokenDB: Token = Token.model_validate(token)

        for userToken in user.tokens:
            if userToken.name == "AtlassianID":
                session.delete(userToken)
        try:
            session.commit()
        except DatabaseError as e:
            raiseDBErrorReadable(e)

        session.add(tokenDB)
        try:
            session.commit()
        except DatabaseError as e:
            raiseDBErrorReadable(e)
        session.refresh(tokenDB)
    else:
        raise InternalServerError(detail="Atlassian connection not configured")


@router.delete(
    "/export/jira/connect",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        **ErrorResponses.conflict,
        **ErrorResponses.server,
        204: {"description": "Nothing"},
    },
)
async def deleteJiraConnectUser(userId: Annotated[str, Depends(getUserId)]) -> None:

    user: User | None = session.get(User, userId)
    if jira:
        if user is None:
            raise Unauthorized(detail="User ID not found")
        for token in user.tokens:
            if token.name == "AtlassianID":
                session.delete(token)
                try:
                    session.commit()
                except DatabaseError as e:
                    raiseDBErrorReadable(e)
                return None
        raise NotFound(detail="No Atlassian token found")
    else:
        raise InternalServerError(detail="Atlassian connection not configured")


@router.post(
    "/export/jira/{jiraProjectID}/{jiraIssueTypeID}",
    status_code=status.HTTP_201_CREATED,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        **ErrorResponses.server,
        201: {"description": "Jira issues were created"},
    },
)
async def postJiraExport(
    request: Request,
    session: SessionDep,
    data: Insert.ExportToJira,
    jiraProjectID: int,
    jiraIssueTypeID: int,
    userId: Annotated[str, Depends(getUserId)],
) -> Response.Export.Jira.Create:
    if jira:
        request.scope["user"] = userId

        requirements: list[Requirement] = []

        for id in data.items:
            requirement: Requirement | None = session.get(Requirement, id)
            if requirement:
                await jira.createIssueFromRequirement(
                    request,
                    jiraProjectID,
                    jiraIssueTypeID,
                    requirement,
                    data.extraFields,
                )
            else:
                raise UnprocessableContent(detail="Unknown id in request")

        return Response.buildResponse(Response.Export.Jira.Create, None)  # type: ignore
    else:
        raise InternalServerError(detail="Atlassian connection not configured")
