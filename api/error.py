import logging
from typing import NoReturn

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

from api.models.response import Response


class NotFound(HTTPException):
    """
    A NotFound (404) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=404, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class Unauthorized(HTTPException):
    """
    An Unauthorized (401) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=401, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class Forbidden(HTTPException):
    """
    A Forbidden (403) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=403, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class AuthConfigMissing(HTTPException):
    """
    An AuthConfigMissing (500) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=500, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class ValidationError(HTTPException):
    """
    A ValidationError (400) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=400, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class ConflictError(HTTPException):
    """
    A ConflictError (409) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=409, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class BadRequest(HTTPException):
    """
    A Bad Request (400) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=400, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class InternalServerError(HTTPException):
    """
    A Internal Server Error (500) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=500, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class UnprocessableContent(HTTPException):
    """
    A Unprocessable Content (422) exception.

    :param HTTPException: Base FastAPI exception
    """

    def __init__(self, status_code=422, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class ErrorResponses:
    """
    Class to manage the error responses. This is mostly used for the openAPI spec generation in FastAPI
    """

    notFound = {404: {"model": Response.ErrorStr, "description": "Item was not found"}}
    unauthorized = {
        401: {"model": Response.ErrorStr, "description": "Authentication is missing"}
    }
    forbidden = {
        403: {
            "model": Response.ErrorStr,
            "description": "Authorization is missing (Missing role)",
        }
    }
    conflict = {
        409: {"model": Response.ErrorStrList, "description": "Dependency conflicts"}
    }
    unprocessable = {422: {"model": Response.Error, "description": "Validation error"}}
    badRequest = {
        400: {
            "model": Response.Error,
            "description": "Can't process request. (E.g. constrain errors)",
        }
    }
    server = {
        404: {
            "model": Response.ErrorStr,
            "description": "Server error (E.g. missing configuration)",
        }
    }


def raiseDBErrorReadable(e: SQLAlchemyError) -> NoReturn:
    logging.getLogger(__name__).error(str(e).replace("\n", "\n    "))
    match type(e).__name__:
        case "IntegrityError":
            raise UnprocessableContent(detail=repr(e))
        case "StatementError":
            raise UnprocessableContent(detail=repr(e))
        case _:
            raise InternalServerError(detail="Unknown Error")
