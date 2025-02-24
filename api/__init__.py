import time
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from api.models.response import Response
from api.routers import (
    audit,
    catalogue,
    coffee,
    comment,
    config,
    extraEntry,
    extraType,
    getRoles,
    requirement,
    tag,
    topic,
)

api = FastAPI(title="ReqDB - API", docs_url=None, redoc_url=None, openapi_url=None)

api.include_router(config.router)
api.include_router(tag.router)
api.include_router(catalogue.router)
api.include_router(comment.router)
api.include_router(topic.router)
api.include_router(requirement.router)
api.include_router(extraType.router)
api.include_router(extraEntry.router)
api.include_router(audit.router)
api.include_router(coffee.router)


@api.get("/openapi.json")
async def openapi(
    roles: Annotated[dict, Depends(getRoles)],
):
    return get_openapi(
        title="FastAPI", version="0.1.0", routes=api.routes, servers=[{"url": "/api"}]
    )


@api.exception_handler(HTTPException)
async def genericExceptionHandler(
    request: Request, exc: HTTPException
) -> Response.Error:
    return JSONResponse(
        {"status": exc.status_code, "error": type(exc).__name__, "message": exc.detail},
        status_code=exc.status_code,
    )


@api.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> Response.Error:
    return JSONResponse(
        {"status": exc.status_code, "error": type(exc).__name__, "message": exc.detail},
        status_code=exc.status_code,
    )


@api.exception_handler(RequestValidationError)
async def http_exception_handler(
    request: Request, exc: RequestValidationError
) -> Response.Error:
    return JSONResponse(
        {"status": 422, "error": type(exc).__name__, "message": exc.errors()},
        status_code=422,
    )


@api.exception_handler(Exception)
async def http_exception_handler(request: Request, exc: Exception) -> Response.Error:
    return JSONResponse(
        {"status": 500, "error": type(exc).__name__, "message": str(exc)},
        status_code=500,
    )


@api.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter_ns()
    response = await call_next(request)
    process_time = time.perf_counter_ns() - start_time
    if "Server-Timing" not in response.headers:
        response.headers["Server-Timing"] = f"app;dur={str(process_time/1000000)}"
    else:
        response.headers["Server-Timing"] += f",app;dur={str(process_time/1000000)}"
    return response
