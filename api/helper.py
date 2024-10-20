from flask import abort
from flask_jwt_extended import get_jwt

def checkAccess(jwt, neededRoles):
    if 'roles' not in jwt or not (set(jwt['roles']) & set(neededRoles)):
        abort(401, "Missing role")

def getUserUPN():
    return get_jwt()["upn"]