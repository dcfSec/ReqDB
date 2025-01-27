from fastapi import HTTPException

from api.models.response import Response


class NotFound(HTTPException):
    def __init__(self, status_code=404, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class Unauthorized(HTTPException):
    def __init__(self, status_code=401, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class Forbidden(HTTPException):
    def __init__(self, status_code=403, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class AuthConfigMissing(HTTPException):
    def __init__(self, status_code=500, detail=None, headers=None):
        super().__init__(status_code, detail, headers)

class ValidationError(HTTPException):
    def __init__(self, status_code=400, detail=None, headers=None):
        super().__init__(status_code, detail, headers)

class ConflictError(HTTPException):
    def __init__(self, status_code=409, detail=None, headers=None):
        super().__init__(status_code, detail, headers)


class ErrorResponses:
    notFound = { 404: {"model": Response.ErrorStr, "description": "Item was not found"} }
    unauthorized = {401: {"model": Response.ErrorStr, "description": "Authentication is missing"}}
    forbidden = {403: {"model": Response.ErrorStr, "description": "Authorization is missing (Missing role)"}}
    conflict = {409: {"model": Response.ErrorStrList, "description": "Dependency conflicts"}}
    unprocessable = {422: {"model": Response.Error, "description": "Validation error"}}