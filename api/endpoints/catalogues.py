from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.helper import checkAccess
from api.models import Catalogue as CatalogueModel
from api.schemas import CatalogueExtendedSchema, CatalogueSchema, \
    CatalogueLightNestedSchema, CatalogueUpdateSchema
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
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: Catalogue resource or 404
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        if request.args.get('nested') is not None:
            schema = CatalogueLightNestedSchema()
        elif request.args.get('extended') is not None:
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
            - Writer

        :param int id: Item id
        :return dict: Updated catalogue resource
        """
        checkAccess(get_jwt(), ['Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        updateSchema = CatalogueLightNestedSchema()
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
            - Writer

        :param int id: Item id
        :return dict: Empty if successful, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        try:
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

    def args(self):
        if request.args.get('nested') is not None:
            return CatalogueLightNestedSchema
        elif request.args.get('extend') is not None:
            return CatalogueExtendedSchema
        else:
            return CatalogueSchema
