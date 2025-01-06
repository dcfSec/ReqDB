from api.appDefinition import db
from sqlalchemy.sql import functions
from sqlalchemy.orm import backref

class User(db.Model):
    id = db.Column(db.String(200), primary_key=True)
    created = db.Column(db.DateTime(timezone=True), server_default=functions.now())

    def __repr__(self):
        return f'<User "{self.id}">'

class Base(db.Model):
    __versioned__ = {}
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)


class RequirementTag(db.Model):
    __tablename__ = "RequirementTag"
    requirementId = db.Column(db.Integer, db.ForeignKey("requirement.id", name="fk_requirement"), index=True, primary_key=True)
    tagId = db.Column(db.Integer, db.ForeignKey("tag.id", name="fk_tag"), index=True, primary_key=True)

    def __repr__(self):
        return f'<RequirementTag "{self.requirementId}" <-> "{self.tagId}">'


class CatalogueTopic(db.Model):
    __tablename__ = "CatalogueTopic"
    catalogueId = db.Column(db.Integer, db.ForeignKey("catalogue.id", name="fk_catalogue"), index=True, primary_key=True)
    topicId = db.Column(db.Integer, db.ForeignKey("topic.id", name="fk_topic"), index=True, primary_key=True)

    def __repr__(self):
        return f'<CatalogueTopic "{self.catalogueId}" <-> "{self.topicId}">'


class Requirement(Base):
    key = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    parentId = db.Column(
        db.Integer,
        db.ForeignKey("topic.id", name="fk_topic"),
        nullable=False,
        index=True,
    )

    extras = db.relationship(
        "ExtraEntry",
        backref="requirement",
        lazy="joined",
        cascade="all, delete",
    )

    tags = db.relationship(
        "Tag",
        secondary="RequirementTag",
        back_populates="requirement",
    )
    visible = db.Column(db.Boolean, unique=False, default=True)

    comments = db.relationship(
        "Comment",
        backref="requirement",
        lazy="joined",
        passive_deletes=True,
        cascade="all, delete",
    )

    def __repr__(self):
        return f'<Requirement "{self.title}">'


class Tag(Base):
    name = db.Column(db.String(50), unique=True, nullable=False)
    requirement = db.relationship(
        "Requirement", secondary="RequirementTag",
        cascade="all, delete",
    )

    def __repr__(self):
        return f'<Tag "{self.name}">'


class Topic(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    parentId = db.Column(
        db.Integer,
        db.ForeignKey("topic.id", name="fk_topic"),
        nullable=True,
        index=True,
    )
    parent = db.relationship(
        "Topic",
        remote_side=[id],
        backref=backref("children", cascade="all, delete"),
        lazy="joined",
        cascade="all, delete",
    )
    requirements = db.relationship(
        "Requirement",
        backref="parent",
        lazy="joined",
        cascade="all, delete",
    )

    catalogues = db.relationship(
        "Catalogue", secondary="CatalogueTopic"
    )

    def __repr__(self):
        return f'<Topic "{self.title}">'


class ExtraType(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    children = db.relationship(
        "ExtraEntry", backref="extraType", passive_deletes=True, cascade="all, delete"
    )
    extraType = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<ExtraType "{self.title}">'


class ExtraEntry(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text)
    extraTypeId = db.Column(
        db.Integer,
        db.ForeignKey("extra_type.id", name="fk_extra_type", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requirementId = db.Column(
        db.Integer,
        db.ForeignKey("requirement.id", name="fk_requirement", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    def __repr__(self):
        return f'<ExtraEntry "{self.content[:20]}">'


class Catalogue(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)

    topics = db.relationship(
        "Topic",
        secondary="CatalogueTopic",
        back_populates="catalogues",
        cascade="all, delete",
    )

    def __repr__(self):
        return f'<Catalogue "{self.title}">'


class Comment(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    comment = db.Column(db.Text)
    requirementId = db.Column(
        db.Integer,
        db.ForeignKey("requirement.id", name="fk_requirement", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author = db.Column(db.String(200), nullable=False)
    created = db.Column(db.DateTime(timezone=True), server_default=functions.now())
    completed = db.Column(db.Boolean, unique=False, default=False)

    def __repr__(self):
        return f'<Comment "{self.author}: {self.comment[:20]}">'


class Audit(Base):
    timestamp = db.Column(db.DateTime(timezone=True), server_default=functions.now())
    user = db.Column(db.String(200))
    table = db.Column(db.String(200))
    target_id = db.Column(db.Integer)
    action = db.Column(db.Integer)
    data = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f'<Audit "{self.verb}">'

