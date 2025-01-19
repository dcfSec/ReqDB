"""
Path mapping for the API.

Maps classes to the API paths
"""

from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from api.appDefinition import api, api_bp, configAPI, db
from api.endpoints.audit import Audit
from api.endpoints.catalogues import Catalogue, Catalogues
from api.endpoints.coffee import Coffee
from api.endpoints.comments import Comment, Comments
from api.endpoints.config import Config, ConfigItem, Static
from api.endpoints.extraEntries import ExtraEntries, ExtraEntry
from api.endpoints.extraTypes import ExtraType, ExtraTypes
from api.endpoints.requirements import Requirement, Requirements
from api.endpoints.tags import Tag, Tags
from api.endpoints.topics import Topic, Topics
from api.endpoints.wildcard import Wildcard
from api.models import User

api.add_resource(Catalogues, "/catalogues")
api.add_resource(Catalogue, "/catalogues/<int:id>")

api.add_resource(Comments, "/comments")
api.add_resource(Comment, "/comments/<int:id>")

api.add_resource(ExtraEntries, "/extraEntries")
api.add_resource(ExtraEntry, "/extraEntries/<int:id>")

api.add_resource(ExtraTypes, "/extraTypes")
api.add_resource(ExtraType, "/extraTypes/<int:id>")

api.add_resource(Requirements, "/requirements")
api.add_resource(Requirement, "/requirements/<int:id>")

api.add_resource(Tags, "/tags")
api.add_resource(Tag, "/tags/<int:id>")

api.add_resource(Topics, "/topics")
api.add_resource(Topic, "/topics/<int:id>")

api.add_resource(Coffee, "/coffee")

api.add_resource(Audit, "/audit/<string:object>/<int:id>", "/audit/<string:object>")

configAPI.add_resource(Static, "/static")
configAPI.add_resource(Config, "")
configAPI.add_resource(ConfigItem, "/<string:key>")
configAPI.add_resource(Wildcard, "", "/", "/<path:path>")


api.add_resource(Wildcard, "", "/", "/<path:path>")


@api_bp.before_request
@jwt_required()
def checkUserInDBorCreate():
    """
    Checks if the user identity is already present in the "User" table.
    If not the user will be created with the email form the JWT
    """
    user = User.query.get(get_jwt_identity())
    if user is None:
        db.session.add(User(id=get_jwt_identity(), email=get_jwt()["email"]))
        db.session.commit()
