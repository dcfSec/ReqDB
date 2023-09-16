from api import api_bp, jwt
from flask import jsonify

from werkzeug.exceptions import HTTPException


@api_bp.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    print("ok")
    # replace the body with JSON
    response.content_type = "application/json"
    return jsonify({
        "status": e.code,
        "name": e.name,
        "data": e.description,
    }), e.code


@api_bp.errorhandler(404)
def page_not_found(e):
    response = e.get_response()
    # replace the body with JSON
    response.content_type = "application/json"
    return jsonify({
        "status": e.code,
        "name": e.name,
        "data": {
            "error": "NotFound",
            "message": [
                "Endpoint not found."
            ]
        },
    }), e.code


@jwt.expired_token_loader
def expiredToken(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "name": "AuthenticationError",
        "data": {
            "error": "ExpiredToken",
            "message": [
                "Token has expired"
            ]
        }
    }), 401


@jwt.invalid_token_loader
def invalidToken(error):
    return jsonify({
        "status": 401,
        "name": "AuthenticationError",
        "data": {
            "error": "InvalidToken",
            "message": [
                error
            ]
        }
    }), 401


@jwt.unauthorized_loader
def unauthorized(error):
    return jsonify({
        "status": 401,
        "name": "AuthenticationError",
        "data": {
            "error": "Unauthorized",
            "message": [
                error
            ]
        }
    }), 401


@jwt.needs_fresh_token_loader
def needsFreshToken(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "name": "AuthenticationError",
        "data": {
            "error": "NeedsFreshToken",
            "message": "Fresh token required"
        }
    }), 401


@jwt.user_lookup_error_loader
def userLookupError(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "name": "AuthenticationError",
        "data": {
            "error": "UserLookupError",
            "message": "Error loading the user"
        }
    }), 401


@jwt.token_verification_failed_loader
def tokenVerificationFailed(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "name": "AuthenticationError",
        "data": {
            "error": "TokenVerificationFailed",
            "message": "User claims verification failed"
        }
    }), 401


@api_bp.errorhandler(500)
def internal(e):
    response = e.get_response()
    # replace the body with JSON
    response.content_type = "application/json"
    return jsonify({
        "status": e.code,
        "name": e.name,
        "data": {
            "error": "InternalError",
            "message": e.description
        },
    }), 500
