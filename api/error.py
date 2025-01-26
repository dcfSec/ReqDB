from fastapi import HTTPException


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