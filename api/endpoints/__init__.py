"""
Path mapping for the API.

Maps classes to the API paths
"""

from api.appDefinition import api_bp, api, db

from api.endpoints.catalogues import Catalogue, Catalogues
from api.endpoints.comments import Comment, Comments
from api.endpoints.extraEntries import ExtraEntry, ExtraEntries
from api.endpoints.extraTypes import ExtraType, ExtraTypes
from api.endpoints.requirements import Requirement, Requirements
from api.endpoints.tags import Tag, Tags
from api.endpoints.topics import Topic, Topics
from api.endpoints.coffee import Coffee
from api.endpoints.wildcard import Wildcard
from api.endpoints.audit import Audit

from api.helper import getUserUPN
from api.models import User
from flask_jwt_extended import jwt_required

api.add_resource(Catalogues, '/catalogues')
api.add_resource(Catalogue, '/catalogues/<int:id>')

api.add_resource(Comments, '/comments')
api.add_resource(Comment, '/comments/<int:id>')

api.add_resource(ExtraEntries, '/extraEntries')
api.add_resource(ExtraEntry, '/extraEntries/<int:id>')

api.add_resource(ExtraTypes, '/extraTypes')
api.add_resource(ExtraType, '/extraTypes/<int:id>')

api.add_resource(Requirements, '/requirements')
api.add_resource(Requirement, '/requirements/<int:id>')

api.add_resource(Tags, '/tags')
api.add_resource(Tag, '/tags/<int:id>')

api.add_resource(Topics, '/topics')
api.add_resource(Topic, '/topics/<int:id>')

api.add_resource(Coffee, '/coffee')

api.add_resource(Audit, '/audit/<string:object>/<int:id>', '/audit/<string:object>')

api.add_resource(Wildcard, '', '/', '/<path:path>')


@api_bp.before_request
@jwt_required()
def checkUserInDBorCreate():
    user = User.query.get(getUserUPN())
    if user is None:
        db.session.add(User(id=getUserUPN()))
        db.session.commit()