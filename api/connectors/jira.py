import re

import httpx
from authlib.integrations.starlette_client import OAuth
from authlib.integrations.starlette_client.apps import StarletteOAuth2App
from authlib.oauth2.rfc6749.wrappers import OAuth2Token
from fastapi import Request
from fastapi.datastructures import URL
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.exc import DatabaseError
from sqlmodel import Session, select

from api.config import AppConfig
from api.connectors import ConnectorConfig
from api.error import BadRequest, Unauthorized, raiseDBErrorReadable
from api.models.db import Requirement, Token, User
from api.models.insert import Insert
from api.models.public import Export
from helper.cache import EncryptedRedisCache


class Jira:

    def __init__(self, session: Session) -> None:
        if ConnectorConfig.Atlassian.TENANT:
            self.client = httpx.Client()
            self.cloudId: str = self.getCloudId(ConnectorConfig.Atlassian.TENANT)
            self.session: Session = session
            oauth = OAuth(update_token=self.updateToken)
            oauth.register(
                name="AtlassianID",
                client_id=ConnectorConfig.Atlassian.OAUTH_CLIENT_ID,
                client_secret=ConnectorConfig.Atlassian.OAUTH_CLIENT_SECRET,
                access_token_url="https://auth.atlassian.com/oauth/token",
                access_token_params=None,
                authorize_url="https://auth.atlassian.com/authorize",
                authorize_params=None,
                api_base_url=None,
                client_kwargs={"scope": ConnectorConfig.Atlassian.OAUTH_SCOPE},
                fetch_token=self.fetchToken,
            )
            self.oauthClient: StarletteOAuth2App = oauth._clients["AtlassianID"]
            self.authCache = EncryptedRedisCache()
            self.headers: dict[str, str] = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        else:
            raise ValueError("Atlassian connection not configured")

    async def fetchToken(self, request: Request) -> dict[str, str | int] | None:
        user: User | None = self.session.get(User, request.user)
        if user is None:
            raise Unauthorized(detail="User Id not found")
        for token in user.tokens:
            if token.name == "AtlassianID":
                return token.to_token()
        return None

    def getCloudId(self, tenant) -> str:
        response: httpx.Response = self.client.get(
            f"https://{tenant}.atlassian.net/_edge/tenant_info",
        )
        response.raise_for_status()

        jsonResponse: dict[str, str] = response.json()
        if "cloudId" not in jsonResponse:
            raise KeyError("Unknown Atlassian tenant")
        return jsonResponse["cloudId"]

    async def getUser(self, request: Request) -> str:
        response: httpx.Response = await self.oauthClient.get(
            f"https://api.atlassian.com/ex/jira/{self.cloudId}/rest/api/3/myself",
            request=request,
            headers=self.headers,
        )
        response.raise_for_status()

        return response.json()["displayName"]  # TODO: Add checks

    async def getActiveToken(self, request: Request):
        await self.getUser(request)
        return await self.fetchToken(request)

    async def updateToken(
        self, name: str, token: dict, refresh_token=None, access_token=None
    ):
        tokenDB: Token | None = None
        if refresh_token:
            tokenDB = self.session.exec(
                select(Token)
                .where(Token.name == name)
                .where(Token.refresh_token == refresh_token)
            ).first()
        elif access_token:
            tokenDB = self.session.exec(
                select(Token)
                .where(Token.name == name)
                .where(Token.access_token == access_token)
            ).first()

        if tokenDB:
            tokenDB.access_token = token["access_token"]
            tokenDB.refresh_token = token["refresh_token"]
            tokenDB.expires_at = token["expires_at"]
            try:
                self.session.commit()
            except DatabaseError as e:
                raiseDBErrorReadable(e)

            self.session.add(tokenDB)

    async def login(
        self, userId: str, request: Request, browser: bool
    ) -> RedirectResponse:
        redirect_uri: URL = request.url_for("getJiraCallback")
        authRequest: RedirectResponse = await self.oauthClient.authorize_redirect(
            request, redirect_uri
        )
        await self.authCache.set(
            list(request.session.keys())[0],
            f"{int(browser)}:{userId}",  # TODO: Add checks for keys()[0]
        )
        return authRequest

    async def callback(self, request: Request) -> Insert.Token | HTMLResponse:

        key, userIdPlusBrowser = await self.authCache.get(
            list(request.session.keys())[0], False  # TODO: Add checks for keys()[0]
        )

        oauthToken: OAuth2Token = await self.oauthClient.authorize_access_token(request)

        token: Insert.Token = Insert.Token.model_validate(
            {
                "name": "AtlassianID",
                "access_token": str(oauthToken["access_token"]),
                "token_type": str(oauthToken["token_type"]),
                "refresh_token": str(oauthToken["refresh_token"]),
                "expires_at": int(oauthToken["expires_at"]),  # type: ignore
            }
        )

        if userIdPlusBrowser:
            browser = int(userIdPlusBrowser.split(":", maxsplit=1)[0])
            print(browser)
            userId = userIdPlusBrowser.split(":", maxsplit=1)[1]
            await self.connectUser(userId, token)

            if browser:
                return HTMLResponse("<script>window.close()</script>")

        return token

    async def connectUser(self, userId: str, token: Insert.Token) -> None:
        token.userId = userId
        user: User | None = self.session.get(User, userId)
        if user is None:
            raise Unauthorized(detail="User ID not found")

        tokenDB: Token = Token.model_validate(token)

        for userToken in user.tokens:
            if userToken.name == "AtlassianID":
                self.session.delete(userToken)
        try:
            self.session.commit()
        except DatabaseError as e:
            raiseDBErrorReadable(e)

        self.session.add(tokenDB)
        try:
            self.session.commit()
        except DatabaseError as e:
            raiseDBErrorReadable(e)
        self.session.refresh(tokenDB)

    async def createIssueFromRequirement(
        self,
        request,
        projectId,
        issueTypeId,
        requirement: Requirement,
        extraFields: dict,
    ):

        description = f"# Description\n\n" f"{requirement.description}\n\n"
        for extra in requirement.extras:
            description += f"# {extra.extraType.title}\n\n" f"{extra.content}\n\n"

        labels: list[str] = [t.name.replace(" ", "") for t in requirement.tags]
        if "labels" in extraFields:
            labels = list(set(labels + extraFields["labels"]))
            del extraFields["labels"]

        description += f"Link to requirement in ReqDB: [{requirement.key}]({AppConfig.BASE_URL}/Browse/Requirement/{requirement.id})"
        response: httpx.Response = await self.oauthClient.post(
            f"https://api.atlassian.com/ex/jira/{self.cloudId}/rest/api/2/issue",
            request=request,
            headers=self.headers,
            json={
                "fields": {
                    "description": MD2Jira.convert(description),
                    "issuetype": {"id": f"{issueTypeId}"},
                    "labels": labels,
                    "project": {"id": f"{projectId}"},
                    "summary": f"[{requirement.key}] {requirement.title}",
                    **extraFields,
                },  # TODO: Add support for extra fields and required fields from /rest/api/2/issue/createmeta/{projectIdOrKey}/issuetypes/{issueTypeId}
                "update": {},
            },
        )

        print(response.text)

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise BadRequest(
                detail=e.response.json()["errorMessages"]
            )  # TODO: Add checks


class MD2Jira:
    reSingleLine: list[tuple[re.Pattern[str], str]] = [
        (re.compile(r"^#{6}\s*(.+)"), r"h6. \1"),
        (re.compile(r"^#{5}\s*(.+)"), r"h5. \1"),
        (re.compile(r"^#{4}\s*(.+)"), r"h4. \1"),
        (re.compile(r"^#{3}\s*(.+)"), r"h3. \1"),
        (re.compile(r"^#{2}\s*(.+)"), r"h2. \1"),
        (re.compile(r"^#\s*(.+)"), r"h1. \1"),
        (re.compile(r"\*\*(.+?)\*\*"), r"--BOLD--\1--BOLD--"),
        (re.compile(r"__(.+?)__"), r"--BOLD--\1--BOLD--"),
        (re.compile(r"\*(.+?)\*"), r"_\1_"),
        (re.compile(r"_(.+?)_"), r"_\1_"),
        (re.compile(r"--BOLD--(.+?)--BOLD--"), r"*\1*"),
        (re.compile(r"`([^`]+)`"), r"{{\1}}"),
        (re.compile(r"~~(.+?)~~"), r"-\1-"),
        (re.compile(r"\[(.*?)\]\((.+?)\)"), r"[\1|\2]"),
        (re.compile(r"^\*\s+"), r"- "),
    ]
    reMultiLine: list[tuple[re.Pattern[str], str]] = [
        (
            re.compile(r"```(\w+)?\n(.*?)\n```", flags=re.MULTILINE | re.DOTALL),
            r"{code:\1}\n\2\n{code}",
        ),
        (
            re.compile(r"```\n(.*?)\n```", flags=re.MULTILINE | re.DOTALL),
            r"{code}\n\1\n{code}",
        ),
    ]

    @classmethod
    def convert(cls, text: str) -> str:
        for r in cls.reMultiLine:
            text = r[0].sub(r[1], text)

        codeBlock = False
        outputText: str = ""
        for line in text.splitlines():
            if line.startswith("{code"):
                codeBlock: bool = not codeBlock

            if not codeBlock:
                for r in cls.reSingleLine:
                    line = r[0].sub(r[1], line)
                outputText += f"{line}\n"

        return outputText
