"""
Error handler for the API. Errors are returned as json.
"""

from api import api_bp, jwt
from flask import jsonify

from werkzeug.exceptions import HTTPException


@api_bp.errorhandler(HTTPException)
def handle_exception(e):
    """Return JSON instead of HTML for HTTP errors."""
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.content_type = "application/json"
    return jsonify({
        "status": e.code,
        "error": e.name,
        "message": e.description,
    }), e.code


@api_bp.errorhandler(404)
def page_not_found(e):
    return jsonify({
        "status": 404,
        "error": "NotFound",
        "message": "Endpoint not found."
    }), 404


@api_bp.errorhandler(405)
def method_not_allowed(e):
    return jsonify({
        "status": 405,
        "error": "MethodNotAllowed",
        "message": "The method is not allowed for the requested URL."
    }), 404


@jwt.expired_token_loader
def expiredToken(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "error": "ExpiredToken",
        "message": "Token has expired"
    }), 401


@jwt.invalid_token_loader
def invalidToken(error):
    return jsonify({
        "status": 401,
        "error": "InvalidToken",
        "message": error
    }), 401


@jwt.unauthorized_loader
def unauthorized(error):
    return jsonify({
        "status": 401,
        "error": "Unauthorized",
        "message": error
    }), 401


@jwt.needs_fresh_token_loader
def needsFreshToken(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "error": "NeedsFreshToken",
        "message": "Fresh token required"
    }), 401


@jwt.user_lookup_error_loader
def userLookupError(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "error": "UserLookupError",
        "message": "Error loading the user"
    }), 401


@jwt.token_verification_failed_loader
def tokenVerificationFailed(jwt_header, jwt_payload):
    return jsonify({
        "status": 401,
        "name": "TokenVerificationFailed",
        "message": "User claims verification failed"
    }), 401


@api_bp.errorhandler(500)
def internal(e):
    return jsonify({
        "status": e.code,
        "name": "InternalError",
        "message": e.description
    }), 500
