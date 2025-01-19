from flask import request
from flask_jwt_extended import get_jwt
from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api.appDefinition import db
from api.endpoints.base import BaseResource, BaseResources
from api.helper import checkAccess
from api.models import ExtraEntry as ExtraEntryModel
from api.schemas import ExtraEntrySchema
from api.updateSchemas import ExtraEntryUpdateSchema


class ExtraEntry(BaseResource):
    """
    ExtraEntry class. This class represents an extra entry object in the API
    """

    def get(self, id: int):
        """
        Returns a single extra entry object or a 404

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :param int id: The object id to use in the query
        :return dict: ExtraEntry resource or 404
        """
        checkAccess(get_jwt(), ['Requirements.Reader'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        schema = ExtraEntrySchema()
        return {
            'status': 200,
            'data': schema.dump(extraEntry)
        }

    def put(self, id: int):
        """
        Updates an extra entry item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Updated extra entry resource
        """
        checkAccess(get_jwt(), ['Requirements.Writer'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        updateSchema = ExtraEntryUpdateSchema()
        schema = ExtraEntrySchema()
        try:
            extraEntry = updateSchema.load(
                request.json, instance=extraEntry,
                partial=True, session=db.session)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(extraEntry)
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
        checkAccess(get_jwt(), ['Requirements.Writer'])
        extraEntry = ExtraEntryModel.query.get_or_404(id)
        try:
            db.session.delete(extraEntry)
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


class ExtraEntries(BaseResources):
    """
    ExtraEntries class, represents the extraEntries API to fetch all or add an
    extraEntries item
    """
    addSchemaClass = ExtraEntryUpdateSchema
    dumpSchemaClass = ExtraEntrySchema
    model = ExtraEntryModel
