from flask import abort
from flask_jwt_extended import get_jwt, get_jwt_identity

def checkAccess(jwt, neededRoles):
    if 'roles' not in jwt or not (set(jwt['roles']) & set(neededRoles)):
        abort(401, "Missing role")

def getUserUPN():
    print(get_jwt_identity())
    return get_jwt()["email"]