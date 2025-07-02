__version__ = "0.1.0"

import logging
import logging.config
import multiprocessing
from collections.abc import Callable, Coroutine
from contextlib import asynccontextmanager
from os import getenv
from typing import Any

import uvicorn
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel
from starlette.config import Config
from starlette.exceptions import HTTPException as StarletteHTTPException

import api
import auth
from api.config import AppConfig
from api.helper import checkAndUpdateConfigDB
from api.models import engine
from api.models.db import *

load_dotenv()
logging.config.dictConfig(AppConfig.LOGGING_CONFIG)


async def not_found(request: Request, exc: HTTPException) -> FileResponse:
    return FileResponse("spa/dist/index.html", status_code=exc.status_code)


exception_handlers: dict[
    int | type[Exception], Callable[[Request, Any], Coroutine[Any, Any, Response]]
] = {
    404: not_found,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    AppConfig.checkNeededEnvVariables()

    oauth = OAuth(Config())

    oauth.register(
        name="oauth",
        server_metadata_url=AppConfig.OAUTH_PROVIDER,
        client_kwargs={
            "scope": f"openid email offline_access {AppConfig.OAUTH_CLIENT_ID}/openid"
        },
    )
    AppConfig.setEmailActiveStatus()
    SQLModel.metadata.create_all(engine)
    AppConfig.getOpenIdConfig()
    AppConfig.getJWKs()
    checkAndUpdateConfigDB()
    yield
    await auth.authSession.sessionStore.close()


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
    title="ReqDB",
)

app.add_middleware(GZipMiddleware)

app.mount("/api", api.api)
app.mount("/auth", auth.auth)

app.mount("/", SPAStaticFiles(directory="spa/dist", html=True), name="index")


if __name__ == "__main__":

    workersEnv: str | None = getenv("USE_UVICORN_WORKERS")
    workers = None
    if workersEnv:
        try:
            workers = int(workersEnv)
        except ValueError:
            print("Can't parse 'USE_UVICORN_WORKERS'.")
            exit(-1)
        if workers == -1:
            workers = (multiprocessing.cpu_count() * 2) + 1

    uvicorn.run(
        "app:app",
        port=8000,
        host="0.0.0.0",
        proxy_headers=True,
        access_log=True,
        workers=workers,
        server_header=False,
        forwarded_allow_ips="*",
    )
