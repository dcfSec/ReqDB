"""
Path mapping for the API.

Maps classes to the API paths
"""

from api import api

from api.endpoints.catalogues import Catalogue, Catalogues
from api.endpoints.extraEntries import ExtraEntry, ExtraEntries
from api.endpoints.extraTypes import ExtraType, ExtraTypes
from api.endpoints.requirements import Requirement, Requirements
from api.endpoints.tags import Tag, Tags
from api.endpoints.topics import Topic, Topics
from api.endpoints.coffee import Coffee
from api.endpoints.base import Base

api.add_resource(Catalogues, '/catalogues')
api.add_resource(Catalogue, '/catalogues/<int:id>')

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

api.add_resource(Base, '', '/', '/<path:path>')
