from sqlalchemy import event
from api.appDefinition import db
from sqlalchemy.orm import mapper
from api.helper import getUserUPN
from api.updateSchemas import (
    TagUpdateSchema,
    ExtraEntryUpdateSchema,
    RequirementUpdateSchema,
    TopicUpdateSchema,
    CatalogueUpdateSchema,
    CommentUpdateSchema,
)
from api.schemas import ExtraTypeSchema, RequirementTag, CatalogueTopicSchema
from api.models import (
    ExtraEntry,
    ExtraType,
    Requirement,
    Tag,
    Topic,
    Catalogue,
    Comment,
    Audit,
    RequirementTag,
    CatalogueTopic,
    Base,
    User,
)
from api.appDefinition import ma
from marshmallow_sqlalchemy import fields
from marshmallow.fields import Function

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
    if target.__tablename__ in schemaMapper:
        connection.execute(
            Audit.__table__.insert().values(
                user=getUserUPN(),
                table=target.__tablename__,
                target_id=target.id,
                action=0,
                data=schemaMapper[target.__tablename__]().dump(target),
            )
        )


@event.listens_for(mapper, "after_update")
def receive_after_update(mapper, connection, target):
    if (
        db.session.is_modified(target, include_collections=False)
        and target.__tablename__ in schemaMapper
    ):
        connection.execute(
            Audit.__table__.insert().values(
                user=getUserUPN(),
                table=target.__tablename__,
                target_id=target.id,
                action=1,
                data=schemaMapper[target.__tablename__]().dump(target),
            )
        )


@event.listens_for(mapper, "before_delete")
def receive_before_delete(mapper, connection, target):
    if target.__tablename__ in schemaMapper:
        connection.execute(
            Audit.__table__.insert().values(
                user=getUserUPN(),
                table=target.__tablename__,
                target_id=target.id,
                action=2,
                data={},
            )
        )


class AuditSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Audit
        include_relationships = True
        include_fk = True
        load_instance = True

    action = Function(lambda obj: ["INSERT", "UPDATE", "DELETE"][obj.action])
