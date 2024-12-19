from operator import itemgetter
from marshmallow import EXCLUDE, post_load, validate
from api.appDefinition import ma
from marshmallow_sqlalchemy import fields

from api.models import ExtraEntry, ExtraType, Requirement, Tag, Topic, Catalogue, Comment


class ExtraEntrySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ExtraEntry
        include_relationships = True
        load_instance = True
        include_fk = True

    requirement = fields.Nested(
        nested="RequirementSchema", exclude=["parent", "extras"]
    )
    extraType = fields.Nested(nested="ExtraTypeSchema", exclude=["children"])


class ExtraTypeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ExtraType
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    extraType = ma.auto_field(validate=validate.Range(min=1, max=3))
    extraEntries = ma.List(
        fields.Nested(nested="ExtraEntrySchema", exclude=["extraType"])
    )


class RequirementSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Requirement
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    tags = ma.List(fields.Nested(nested="TagSchema", exclude=["requirement"]))
    extras = ma.List(fields.Nested(nested="ExtraEntrySchema", exclude=["requirement"]))
    parent = fields.Nested(nested="TopicSchema", exclude=["requirements"])


class RequirementCommentsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Requirement
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    tags = ma.List(fields.Nested(nested="TagSchema", exclude=["requirement"]))
    extras = ma.List(fields.Nested(nested="ExtraEntrySchema", exclude=["requirement"]))
    comments = ma.List(fields.Nested(nested="CommentSchema", exclude=["requirement"]))
    parent = fields.Nested(nested="TopicSchema", exclude=["requirements"])


class TagSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        include_relationships = True
        load_instance = True
        include_fk = True

    name = ma.auto_field(validate=validate.Length(min=1, max=50))
    requirement = fields.Nested(nested="RequirementSchema", exclude=["tags"], many=True)


class TagMinimalSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tag
        include_relationships = True
        load_instance = True
        include_fk = True

    name = ma.auto_field(validate=validate.Length(min=1))
    requirement = fields.Nested(nested="RequirementSchema", only=["id"], many=True)


class TopicSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Topic
        include_relationships = True
        load_instance = True
        include_fk = True

    id = ma.auto_field()
    title = ma.auto_field(required=True)
    key = ma.auto_field(required=True)
    description = ma.auto_field(required=True)
    parentId = ma.auto_field(required=False)
    children = ma.List(fields.Nested(nested="TopicSchema"))
    requirements = fields.Nested(
        nested="RequirementSchema", exclude=["parent", "comments"], many=True
    )
    parent = fields.Nested(nested="TopicSchema", exclude=["requirements", "children"])

    @post_load
    def sortRequirements(self, item):
        item['requirements'] = sorted(item['requirements'], key=itemgetter('key'))
        return item

    @post_load
    def sortTopics(self, item):
        item['children'] = sorted(item['children'], key=itemgetter('key'))
        return item


class TopicCommentsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Topic
        include_relationships = True
        load_instance = True
        include_fk = True

    id = ma.auto_field()
    title = ma.auto_field(required=True)
    key = ma.auto_field(required=True)
    description = ma.auto_field(required=True)
    parentId = ma.auto_field(required=False)
    children = ma.List(fields.Nested(nested="TopicCommentsSchema"))
    requirements = fields.Nested(
        nested="RequirementCommentsSchema", exclude=["parent"], many=True
    )
    parent = fields.Nested(nested="TopicCommentsSchema", exclude=["requirements", "children"])

    @post_load
    def sortRequirements(self, item):
        item['requirements'] = sorted(item['requirements'], key=itemgetter('key'))
        return item

    @post_load
    def sortTopics(self, item):
        item['children'] = sorted(item['children'], key=itemgetter('key'))
        return item

class TopicOnlyIDAndTitleSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Topic
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    id = ma.auto_field()
    title = ma.auto_field(required=True)
    key = ma.auto_field(required=True)


class CatalogueSchema(ma.SQLAlchemyAutoSchema):
    """
    Default catalogue schema. Without any nested elements
    """

    class Meta:
        model = Catalogue
        include_relationships = True
        load_instance = True
        include_fk = True

    title = ma.auto_field(validate=validate.Length(min=1))


class CatalogueLightNestedSchema(ma.SQLAlchemyAutoSchema):
    """
    Catalogue schema with topics (id, title) as nested elements
    """

    class Meta:
        model = Catalogue
        include_relationships = True
        load_instance = True
        include_fk = True
        unknown = EXCLUDE

    title = ma.auto_field(validate=validate.Length(min=1))
    topics = fields.Nested(nested="TopicSchema", only=["id", "title"], many=True, unknown=EXCLUDE)


class CatalogueExtendedSchema(ma.SQLAlchemyAutoSchema):
    """
    Catalogue schema with all nested elements
    """

    class Meta:
        model = Catalogue
        include_relationships = True
        load_instance = True
        include_fk = True

    title = ma.auto_field(validate=validate.Length(min=1))
    topics = fields.Nested(nested="TopicSchema", many=True)

    @post_load
    def sortTopics(self, item):
        item['topics'] = sorted(item['topics'], key=itemgetter('key'))
        return item


class CatalogueExtendedCommentsSchema(ma.SQLAlchemyAutoSchema):
    """
    Catalogue schema with all nested elements
    """

    class Meta:
        model = Catalogue
        include_relationships = True
        load_instance = True
        include_fk = True

    title = ma.auto_field(validate=validate.Length(min=1))
    topics = fields.Nested(nested="TopicCommentsSchema", many=True)

    @post_load
    def sortTopics(self, item):
        item['topics'] = sorted(item['topics'], key=itemgetter('key'))
        return item

class CommentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Comment
        include_relationships = True
        load_instance = True
        include_fk = True

    requirement = fields.Nested(
        nested="RequirementSchema", only=["id", "title"]
    )
