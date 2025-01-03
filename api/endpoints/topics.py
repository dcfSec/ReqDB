from flask import request

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api.appDefinition import db
from api.models import Topic as TopicModel
from api.schemas import TopicSchema, TopicOnlyIDAndTitleSchema, TopicCommentsSchema
from api.updateSchemas import TopicUpdateSchema
from api.endpoints.base import BaseResource, BaseResources


from api.helper import checkAccess

from flask_jwt_extended import get_jwt


class Topic(BaseResource):
    """
    Topic class. This class represents a topic object in the API
    """

    def get(self, id: int):
        """
        Returns a single topic object or a 404

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :param int id: The object id to use in the query
        :return dict: Topic resource or 404
        """
        checkAccess(get_jwt(), ["Requirements.Reader", "Requirements.Writer"])
        topic = TopicModel.query.get_or_404(id)
        schema = TopicSchema()
        return {"status": 200, "data": schema.dump(topic)}

    def put(self, id: int):
        """
        Updates a topic item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Updated topic resource
        """
        checkAccess(get_jwt(), ["Requirements.Writer"])
        topic = TopicModel.query.get_or_404(id)
        updateSchema = TopicUpdateSchema()
        schema = TopicSchema()
        try:
            topic = updateSchema.load(
                request.json, instance=topic, partial=True, session=db.session
            )
            if topic.id == topic.parentId:
                return {
                    "status": 400,
                    "error": "ValidationError",
                    "message": ["Parent id can't be item id"],
                }, 400

            if (
                topic.parentId is not None
                and TopicModel.query.get(topic.parentId) is None
            ):
                return {
                    "status": 400,
                    "error": "ValidationError",
                    "message": [f"Parent with id {topic.parentId} not found"],
                }, 400
            if topic.children != [] and topic.requirements != []:
                return {
                    "status": 400,
                    "error": "ValidationError",
                    "message": ["Topics can't have children and requirements"],
                }, 400
            if topic.parentId is not None:
                parent = TopicModel.query.get_or_404(topic.parentId)
                if parent.requirements != []:
                    return {
                        "status": 400,
                        "error": "ValidationError",
                        "message": [
                            "Parent Topic can't have children and requirements"
                        ],
                    }, 400
            db.session.commit()
            return {"status": 200, "data": schema.dump(topic)}
        except ValidationError as e:
            return {
                "status": 400,
                "error": "ValidationError",
                "message": e.messages,
            }, 400
        except IntegrityError as e:
            return {"status": 400, "error": "IntegrityError", "message": e.args}, 400

    def delete(self, id: int):
        """
        Deletes a topic item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Empty (204) if successful, else error message
        """
        checkAccess(get_jwt(), ["Requirements.Writer"])
        topic = TopicModel.query.get_or_404(id)
        if len(topic.children) > 0 and request.args.get("force") is None and request.args.get("cascade") is None:
            return {
                "status": 400,
                "error": "ValidationError",
                "message": [
                    "Topic has children.",
                    "Use ?force to delete anyway.",
                ],
            }, 400
        if len(topic.requirements) > 0 and request.args.get("force") is None:
            return {
                "status": 400,
                "error": "ValidationError",
                "message": [
                    "Topic has requirements.",
                    "Use ?force to delete anyway (This will delete also the requirements and ExtraEntries)",
                ],
            }, 400
        try:
            if len(topic.children) > 0 and request.args.get("force") is not None and request.args.get("cascade") is None:
                topic.children = []
                db.session.commit()
            db.session.delete(topic)
            db.session.commit()
            return {}, 204
        except ValidationError as e:
            return {
                "status": 400,
                "error": "ValidationError",
                "message": e.messages,
            }, 400
        except IntegrityError as e:
            return {"status": 400, "error": "IntegrityError", "message": e.args}, 400


class Topics(BaseResources):
    """
    Topics class, represents the Topics API to fetch all or add a
    topic item
    """

    addSchemaClass = TopicUpdateSchema
    dumpSchemaClass = TopicSchema
    model = TopicModel

    def getDynamicSchema(self):
        if request.args.get("minimal") is not None:
            return TopicOnlyIDAndTitleSchema
        else:
            if "Comments.Reader" in get_jwt()["roles"]:
                return TopicCommentsSchema
            else:
                return TopicSchema
