from flask import abort

from api.models import (
    ExtraEntry,
    ExtraType,
    Requirement,
    Tag,
    Topic,
    Catalogue,
    Comment,
    Audit as AuditModel,
)

from api.endpoints.base import BaseResource

from api.audit import AuditSchema

from api.helper import checkAccess

from flask_jwt_extended import get_jwt
from sqlalchemy import and_


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
            "extraEntries": (ExtraEntry, "Requirements.Auditor"),
            "extraTypes": (ExtraType, "Requirements.Auditor"),
            "requirements": (Requirement, "Requirements.Auditor"),
            "tags": (Tag, "Requirements.Auditor"),
            "topics": (Topic, "Requirements.Auditor"),
            "catalogues": (Catalogue, "Requirements.Auditor"),
            "comments": (Comment, "Comments.Auditor"),
        }

        if object not in modelMapping.keys():
            abort(404)

        checkAccess(get_jwt(), [modelMapping[object][1]])

        if id is not None:
            versions = AuditModel.query.filter(
                and_(
                    AuditModel.table == modelMapping[object][1],
                    AuditModel.target_id == id,
                )
            ).all()
            if len(versions) == 0:
                abort(404)
        else:
            versions = AuditModel.query.filter(
                AuditModel.table == modelMapping[object][0].__tablename__
            ).all()

        schema = AuditSchema(many=True)
        return {
            "status": 200,
            "data": sorted(
                schema.dump(versions), key=lambda x: x["timestamp"], reverse=True
            ),
        }
