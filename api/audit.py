from flask_jwt_extended import get_jwt_identity
from marshmallow import EXCLUDE
from marshmallow.fields import Function
from marshmallow_sqlalchemy import fields
from sqlalchemy import event
from sqlalchemy.orm import mapper

from api.appDefinition import db, ma
from api.models import (
    Audit,
    Base,
    Catalogue,
    CatalogueTopic,
    Comment,
    ExtraEntry,
    ExtraType,
    Requirement,
    RequirementTag,
    Tag,
    Topic,
    User,
)
from api.schemas import (
    CatalogueTopicSchema,
    ExtraTypeSchema,
    RequirementTag,
    UserSchema,
)
from api.updateSchemas import (
    CatalogueUpdateSchema,
    CommentUpdateSchema,
    ExtraEntryUpdateSchema,
    RequirementUpdateSchema,
    TagUpdateSchema,
    TopicUpdateSchema,
)

schemaMapper = {
    ExtraEntry.__tablename__: ExtraEntryUpdateSchema,
    ExtraType.__tablename__: ExtraTypeSchema,
    Requirement.__tablename__: RequirementUpdateSchema,
    Tag.__tablename__: TagUpdateSchema,
    Topic.__tablename__: TopicUpdateSchema,
    Catalogue.__tablename__: CatalogueUpdateSchema,
    Comment.__tablename__: CommentUpdateSchema,
    # RequirementTag.__tablename__: RequirementTag,
    # CatalogueTopic.__tablename__: CatalogueTopicSchema,
    # User__tablename__: ,
}


@event.listens_for(mapper, "after_insert")
def receive_after_insert(mapper, connection, target):
    """
    Event listener for "insert".
    This adds the insert actions to the audit table

    :param ? mapper: SQLAlchemy Mapper
    :param ? connection: SQLAlchemy connection
    :param ? target: SQLAlchemy target for insert
    """
    if target.__tablename__ in schemaMapper:
        connection.execute(
            Audit.__table__.insert().values(
                userId=get_jwt_identity(),
                table=target.__tablename__,
                target_id=target.id,
                action=0,
                data=schemaMapper[target.__tablename__]().dump(target),
            )
        )


@event.listens_for(mapper, "after_update")
def receive_after_update(mapper, connection, target):
    """
    Event listener for "update".
    This adds the update actions to the audit table

    :param ? mapper: SQLAlchemy Mapper
    :param ? connection: SQLAlchemy connection
    :param ? target: SQLAlchemy target for insert
    """
    if (
        db.session.is_modified(target, include_collections=False)
        and target.__tablename__ in schemaMapper
    ):
        connection.execute(
            Audit.__table__.insert().values(
                userId=get_jwt_identity(),
                table=target.__tablename__,
                target_id=target.id,
                action=1,
                data=schemaMapper[target.__tablename__]().dump(target),
            )
        )


@event.listens_for(mapper, "before_delete")
def receive_before_delete(mapper, connection, target):
    """
    Event listener for "delete".
    This adds the delete actions to the audit table

    :param ? mapper: SQLAlchemy Mapper
    :param ? connection: SQLAlchemy connection
    :param ? target: SQLAlchemy target for insert
    """
    if target.__tablename__ in schemaMapper:
        connection.execute(
            Audit.__table__.insert().values(
                userId=get_jwt_identity(),
                table=target.__tablename__,
                target_id=target.id,
                action=2,
                data={},
            )
        )


class AuditSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Audit
        include_relationships = True
        include_fk = True
        load_instance = True
        unknown = EXCLUDE

    id = ma.auto_field()
    timestamp = ma.auto_field()
    table = ma.auto_field()
    target_id = ma.auto_field()
    data = ma.auto_field()
    action = Function(lambda obj: ["INSERT", "UPDATE", "DELETE"][obj.action])
    user = fields.Nested(nested="UserSchema", only=["id", "email"])
