from flask import jsonify


def checkAccess(jwt, neededRoles):
    if 'roles' not in jwt or not (set(jwt['roles']) & set(neededRoles)):
        return jsonify({
            "status": "401",
            "name": "AuthorizationError",
            "data": {
                "error": "NotPermitted",
                "message": "User is not permitted to access this resource"
            },
        }), 401
