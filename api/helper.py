from flask import abort


def checkAccess(jwt, neededRoles):
    if 'roles' not in jwt or not (set(jwt['roles']) & set(neededRoles)):
        abort(401, {
            'error': 'AuthorizationError',
            'message': "User is not permitted to access this ressource"
        })
