from marshmallow import EXCLUDE, validate
from marshmallow.fields import Function
from api.appDefinition import ma
from marshmallow_sqlalchemy import fields
from sqlalchemy_continuum import version_class, transaction_class

from api.models import ExtraEntry, ExtraType, Requirement, Tag, Topic, Catalogue, Comment


class TransactionSchema(ma.SQLAlchemySchema):
    class Meta:
        model = transaction_class(Tag)
        include_relationships = True
        include_fk = True
        load_instance = True

    id = ma.auto_field()
    user_id = ma.auto_field()
    issued_at = ma.auto_field()
    
    transaction = fields.Nested(nested="TransactionSchema")

class VersionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        include_relationships = True
        include_fk = True
        load_instance = True

    transaction = fields.Nested(nested="TransactionSchema")
    verb = Function(lambda obj: ['INSERT', 'UPDATE', 'DELETE'][obj.operation_type])


class TagVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(Tag)


class CatalogueVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(Catalogue)


class TopicVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(Topic)


class RequirementVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(Requirement)


class ExtraTypeVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(ExtraType)


class ExtraEntryVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(ExtraEntry)


class CommentVersionSchema(VersionSchema):
    class Meta(VersionSchema.Meta):
        model = version_class(Comment)