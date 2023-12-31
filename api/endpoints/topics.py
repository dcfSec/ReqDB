from flask_restful import Resource
from flask import request, abort

from marshmallow.exceptions import ValidationError
from sqlalchemy.exc import IntegrityError

from api import db
from api.models import Topic as TopicModel
from api.schemas import TopicSchema, TopicUpdateSchema, \
    TopicOnlyIDAndTitleSchema

from api.helper import checkAccess

from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt


class Topic(Resource):
    """
    Topic class. This class represents a topic object in the API
    """
    method_decorators = [jwt_required()]

    def get(self, id: int):
        """
        Returns a single topic object or a 404

        Required roles:
            - Reader
            - Writer

        :param int id: The object id to use in the query
        :return dict: Topic ressource or 404
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        topic = TopicModel.query.get_or_404(id)
        schema = TopicSchema()
        return {
            'status': 200,
            'data': schema.dump(topic)
        }

    def put(self, id: int):
        """
        Updates a topic item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Updated topic ressource
        """
        checkAccess(get_jwt(), ['Writer'])
        topic = TopicModel.query.get_or_404(id)
        updateSchema = TopicUpdateSchema()
        schema = TopicSchema()
        try:
            topic = updateSchema.load(request.json, instance=topic,
                                      partial=True, session=db.session)
            if topic.id == topic.parentId:
                abort(400, {
                    'error': 'ValidationError',
                    'message': ['Parent id can\'t be item id']})

            if topic.parentId is not None \
                    and TopicModel.query.get(topic.parentId) is None:
                abort(400, {
                    'error': 'ValidationError',
                    'message': [f'Parent with id {topic.parentId} not found']})
            if topic.children != [] and topic.requirements != []:
                abort(400, {
                    'error': 'ValidationError',
                    'message': [
                        'Topics can\'t have children and requirements'
                    ]})
            if topic.parentId is not None:
                parent = TopicModel.query.get_or_404(topic.parentId)
                if parent.requirements != []:
                    abort(400, {
                        'error': 'ValidationError',
                        'message': [
                            "Parent Topic can't have children and requirements"
                        ]})
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(topic)
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
        Deletes a topic item

        Required roles:
            - Writer

        :param int id: Item id
        :return dict: Empty (204) if successfull, else error message
        """
        checkAccess(get_jwt(), ['Writer'])
        topic = TopicModel.query.get_or_404(id)
        if ((len(topic.requirements) > 0) or len(topic.children) > 0) and \
                request.args.get('force') is None:
            abort(400, {
                'error': 'ValidationError',
                'message': ['Topic has requirements or children.',
                            'Use ?force to delete anyway']})
        try:
            db.session.delete(topic)
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


class Topics(Resource):
    """
    Topics class, represents the Topics API to fetch all or add a
    topic item
    """
    method_decorators = [jwt_required()]

    def get(self):
        """Get all topic elements

        Required roles:
            - Reader
            - Writer

        :return list: All topic elements
        """
        checkAccess(get_jwt(), ['Reader', 'Writer'])
        if request.args.get('root') is not None:
            topics = TopicModel.query.filter_by(parentId=None)
        else:
            topics = TopicModel.query.all()
        if request.args.get('minimal') is not None:
            schema = TopicOnlyIDAndTitleSchema(many=True)
        else:
            schema = TopicSchema(many=True)
        return {
            'status': 200,
            'data': schema.dump(topics)
        }

    def post(self):
        """
        Adds a new topic item

        Required roles:
            - Writer

        :return dict: The new topic item
        """
        checkAccess(get_jwt(), ['Writer'])
        updateSchema = TopicUpdateSchema()
        schema = TopicSchema()
        try:
            topic = updateSchema.load(request.json)
            db.session.add(topic)
            db.session.commit()
            return {
                'status': 200,
                'data': schema.dump(topic)
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
