from flask import abort

from marshmallow.exceptions import ValidationError

from api.models import (
    ExtraEntry,
    ExtraType,
    Requirement,
    Tag,
    Topic,
    Catalogue,
    Comment,
)

from api.versionSchemas import (
    TagVersionSchema,
    ExtraEntryVersionSchema,
    ExtraTypeVersionSchema,
    RequirementVersionSchema,
    TagVersionSchema,
    TopicVersionSchema,
    CatalogueVersionSchema,
    CommentVersionSchema,
)
from api.endpoints.base import BaseResource

from sqlalchemy_continuum import version_class, transaction_class

from api.helper import checkAccess

from flask_jwt_extended import get_jwt


class Audit(BaseResource):
    """
    Tag class. This class represents a tag object in the API
    """

    def get(self, object: str, id: int = None):
        """
        Returns a single tag object or a 404

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :param int id: The object id to use in the query
        :return dict: Tag resource or 404
        """
        checkAccess(get_jwt(), ["Requirements.Auditor", "Comments.Auditor"])

        modelMapping = {
            "extraEntries": (ExtraEntry, ExtraEntryVersionSchema, "Requirements.Auditor"),
            "extraTypes": (ExtraType, ExtraTypeVersionSchema, "Requirements.Auditor"),
            "requirements": (Requirement, RequirementVersionSchema, "Requirements.Auditor"),
            "tags": (Tag, TagVersionSchema, "Requirements.Auditor"),
            "topics": (Topic, TopicVersionSchema, "Requirements.Auditor"),
            "catalogues": (Catalogue, CatalogueVersionSchema, "Requirements.Auditor"),
            "comments": (Comment, CommentVersionSchema, "Comments.Auditor"),
        }

        if object not in modelMapping.keys():
            abort(404)

        checkAccess(get_jwt(), [modelMapping[object][2]])

        version = version_class(modelMapping[object][0])

        if id is not None:
            versions = version.query.where(version.id == id).all()
            if len(versions) == 0:
                abort(404)
        else:
            versions = version.query.all()

        schema = modelMapping[object][1](many=True)

        return {"status": 200, "data": schema.dump(versions)}
