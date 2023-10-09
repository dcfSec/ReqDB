from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.helper import checkAccess
from api.models import Catalogue as CatalogueModel
from api.schemas import CatalogueExtendedSchema, CatalogueSchema, \
    CatalogueLightNestedSchema

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Catalogue(Resource):
    """
    Catalogue class. This class represents a catalogue object in the API
    """
    method_decorators = [jwt_required()]

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
        :return dict: Catalogue ressource or 404
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
        :return dict: Updated catalogue ressource
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
        :return dict: Empty if successfull, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        catalogue = CatalogueModel.query.get_or_404(id)
        if (len(catalogue.extras) > 0) \
                and request.args.get('force') is None:
            abort(400, {
                'error': 'ValidationError',
                'message': [
                    'Catalogue has extras. Use ?force to delete anyway'
                ]})
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


class Catalogues(Resource):
    """
    Catalogues class, represents the catalogues API to fetch all or add a
    catalogue item
    """
    method_decorators = [jwt_required()]

    def get(self):
        """Get all catalogue elements

        If the argument "nested" is provided the topics will be nested with
        title and ID.

        If the argument "extended" is provided all children will be provided.
        Including topics, requirements, extra entries and tags.

        Required roles:
            - Reader
            - Writer

        :return list: All catalogue elements
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        catalogues = CatalogueModel.query.all()
        if request.args.get('nested') is not None:
            schema = CatalogueLightNestedSchema(many=True)
        elif request.args.get('extend') is not None:
            schema = CatalogueExtendedSchema(many=True)
        else:
            schema = CatalogueSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(catalogues)
        }

    def post(self):
        """
        Adds a new catalogue item

        Required roles:
            - Writer

        :return dict: The new catalogue item
        """
        checkAccess(get_jwt(), ['Writer'])
        schema = CatalogueLightNestedSchema()
        try:
            catalogue = schema.load(request.json, session=db.session)
            db.session.add(catalogue)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(catalogue)
            }, 201
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
