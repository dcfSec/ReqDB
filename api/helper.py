from flask import abort
from flask_jwt_extended import get_jwt

def checkAccess(jwt, neededRoles):
    if 'roles' not in jwt or not (set(jwt['roles']) & set(neededRoles)):
        abort(401, {
            "status": "401",
            "name": "AuthorizationError",
            "data": {
                "error": "NotPermitted",
                "message": "User is not permitted to access this resource"
            },
        })

def getUserUPN():
    return get_jwt()["upn"]