from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api.appDefinition import db
from api.helper import checkAccess
from api.models import Catalogue as CatalogueModel
from api.schemas import CatalogueExtendedSchema, CatalogueSchema, \
    CatalogueLightNestedSchema, CatalogueExtendedCommentsSchema
from api.updateSchemas import CatalogueUpdateSchema
from api.endpoints.base import BaseResource, BaseResources

from flask_jwt_extended import get_jwt


class Catalogue(BaseResource):
    """
    Catalogue class. This class represents a catalogue object in the API
    """

    def get(self, id: int):
        """
        Returns a single catalogue object or a 404

        If the argument "nested" is provided the topics will be nested with
        title and ID.

        If the argument "extended" is provided all children will be provided.
        Including topics, requirements, extra entries and tags.

        Required roles:
            - Requirements.Reader
            - Requirements.Writer

        :param int id: The object id to use in the query
        :return dict: Catalogue resource or 404
        """
        checkAccess(get_jwt(), ['Requirements.Reader'])
        catalogue = CatalogueModel.query.get_or_404(id)
        if request.args.get('nested') is not None:
            schema = CatalogueLightNestedSchema()
        elif request.args.get('extended') is not None:
            if 'Comments.Reader' in get_jwt()['roles']:
                schema = CatalogueExtendedCommentsSchema()
            else:
                schema = CatalogueExtendedSchema()
        else:
            schema = CatalogueSchema()
        return {
            'status': 200,
            'data': schema.dump(catalogue)
        }

    def put(self, id: int):
        """
        Updates a catalogue item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Updated catalogue resource
        """
        checkAccess(get_jwt(), ['Requirements.Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        updateSchema = CatalogueUpdateSchema()
        schema = CatalogueExtendedSchema()
        try:
            catalogue = updateSchema.load(
                request.json, instance=catalogue,
                partial=True, session=db.session)

            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(catalogue)
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
        Deletes a catalogue item

        Required roles:
            - Requirements.Writer

        :param int id: Item id
        :return dict: Empty if successful, else error message
        """
        checkAccess(get_jwt(), ['Requirements.Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        print(request.args.get("force"), request.args.get("cascade"))
        if len(catalogue.topics) > 0 and request.args.get("force") is None and request.args.get("cascade") is None:
            return {
                "status": 400,
                "error": "ValidationError",
                "message": [
                    "Catalogue has topics.",
                    "Use ?force to delete anyway and ?cascade to also delete all topics and requirements recursively.",
                ],
            }, 400
        try:
            if len(catalogue.topics) > 0 and request.args.get("force") is not None and request.args.get("cascade") is None:
                catalogue.topics = []
                db.session.commit()
            db.session.delete(catalogue)
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


class Catalogues(BaseResources):
    """
    Catalogues class, represents the catalogues API to fetch all or add a
    catalogue item
    """
    addSchemaClass = CatalogueUpdateSchema
    dumpSchemaClass = CatalogueLightNestedSchema
    model = CatalogueModel

    def getDynamicSchema(self):
        if request.args.get('nested') is not None:
            return CatalogueLightNestedSchema
        elif request.args.get('extend') is not None:
            if 'Comments.Reader' in get_jwt()['roles']:
                return CatalogueExtendedCommentsSchema
            else:
                return CatalogueExtendedSchema
        else:
            return CatalogueSchema
