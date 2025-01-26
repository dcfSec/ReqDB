__version__ = "0.1.0"

from contextlib import asynccontextmanager

from authlib.integrations.starlette_client import OAuth
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel
from starlette.config import Config
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

import api
from api.config import AppConfig
from api.helper import checkAndUpdateConfigDB
from api.models import engine
from api.models.db import *


async def not_found(request: Request, exc: HTTPException):
    return FileResponse("front-end/dist/index.html", status_code=exc.status_code)


exception_handlers = {
    404: not_found,
}


config = Config(".env")
oauth = OAuth(config)

oauth.register(
    name="oauth",
    server_metadata_url=AppConfig.JWT_PROVIDER,
    client_kwargs={
        "scope": f"openid email offline_access {AppConfig.JWT_DECODE_AUDIENCE}/openid"
    },
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    AppConfig.getOpenIdConfig()
    AppConfig.getJWKs()
    checkAndUpdateConfigDB()
    yield


class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (HTTPException, StarletteHTTPException) as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            else:
                raise ex


app = FastAPI(
    exception_handlers=exception_handlers,
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.add_middleware(SessionMiddleware, secret_key="!secret")

app.mount("/api", api.api)

app.mount("/", SPAStaticFiles(directory="front-end/dist", html=True), name="index")
