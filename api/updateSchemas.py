from marshmallow import EXCLUDE, ValidationError, validate, validates_schema
from api.appDefinition import ma
from marshmallow_sqlalchemy import fields

from api.models import ExtraEntry, ExtraType, Requirement, Tag, Topic, Catalogue, Comment, Configuration


class ExtraEntryUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ExtraEntry
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE


class RequirementUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Requirement
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    description = ma.auto_field()
    key = ma.auto_field()
    parentId = ma.auto_field()
    title = ma.auto_field()
    visible = ma.auto_field()
    tags = ma.List(fields.Nested(nested="TagUpdateSchema", only=["id"], unknown=EXCLUDE))


class TagUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        include_relationships = True
        include_fk = True
        load_instance = True
        unknown = EXCLUDE

    name = ma.auto_field(validate=validate.Length(min=1))
    requirement = fields.Nested(nested="RequirementUpdateSchema", only=["id"], many=True)


class TopicUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Topic
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    title = ma.auto_field(required=True)
    key = ma.auto_field(required=True)
    description = ma.auto_field(required=True)
    parentId = ma.auto_field(required=False)


class CatalogueUpdateSchema(ma.SQLAlchemyAutoSchema):
    """
    Catalogue schema with topics (id) as nested elements
    """

    class Meta:
        model = Catalogue
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    title = ma.auto_field(validate=validate.Length(min=1))
    topics = fields.Nested(nested="TopicUpdateSchema", only=["id"], many=True, unknown=EXCLUDE)


class CommentUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Comment
        include_relationships = False
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    comment = ma.auto_field(validate=validate.Length(min=1), required=True)
    requirementId = ma.auto_field(required=True)
    authorId = ma.auto_field(required=True)
    completed = ma.auto_field()


class ConfigurationUpdateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Configuration
        load_instance = True
        unknown = EXCLUDE
    
    value = ma.auto_field()
    
    @validates_schema()
    def validateType(self, data, **kwargs):
        if self.instance.type == "boolean" and data["value"] not in ["true", "false"]:
            raise ValidationError('Value must be boolean', "value")
