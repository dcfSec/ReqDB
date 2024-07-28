from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import Requirement, Comment as CommentModel
from api.schemas import CommentSchema, CommentUpdateSchema
from api.endpoints.base import BaseResource, BaseResources

from api.helper import checkAccess

from flask_jwt_extended import get_jwt, get_jwt_identity


class Comment(BaseResource):
    """
    Comment class. This class represents an extra entry object in the API
    """

    def get(self, id: int):
        """
        Returns a single extra entry object or a 404

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :param int id: The object id to use in the query
        :return dict: Comment resource or 404
        """
        checkAccess(get_jwt(), ['Comments.Reader'])
        comment = CommentModel.query.get_or_404(id)
        schema = CommentSchema()
        return {
            'status': 200,
            'data': schema.dump(comment)
        }

    def put(self, id: int):
        """
        Updates an extra entry item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Updated extra entry resource
        """
        checkAccess(get_jwt(), ['Comments.Writer'])
        comment = CommentModel.query.get_or_404(id)
        updateSchema = CommentUpdateSchema()
        schema = CommentSchema()
        try:
            comment = updateSchema.load(
                request.json, instance=comment,
                partial=True, session=db.session)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(comment)
            }
        except ValidationError as e:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': e.messages
            }, 400
        except IntegrityError as e:
            return {
                'status': 400,
                'error':
                'IntegrityError',
                'message': e.args
            }, 400

    def delete(self, id: int):
        """
        Deletes an extra entry item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Empty (204) if successful, else error message
        """
        checkAccess(get_jwt(), ['Comments.Moderator'])
        comment = CommentModel.query.get_or_404(id)
        try:
            db.session.delete(comment)
            db.session.commit()
            return {}, 204
        except ValidationError as e:
            return {
                'status': 400,
                'error': 'ValidationError',
                'message': e.messages
            }, 400
        except IntegrityError as e:
            return {
                'status': 400,
                'error':
                'IntegrityError',
                'message': e.args
            }, 400


class Comments(BaseResources):
    """
    Comments class, represents the comments API to fetch all or add an
    comments item
    """
    neededPostAccess = ['Comments.Writer']
    neededGetAccess = ['Comments.Reader']

    addSchemaClass = CommentUpdateSchema
    dumpSchemaClass = CommentSchema
    model = CommentModel

    def checkRequest(self, data):
        data["author"] = get_jwt()["upn"]
        if "created" in data:
            del data["created"]
        return data
