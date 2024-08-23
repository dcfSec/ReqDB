from api import db
from sqlalchemy.sql import functions


class Base(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)


class RequirementTag(Base):
    __tablename__ = "RequirementTag"
    requirementId = db.Column(db.Integer, db.ForeignKey("requirement.id"), index=True)
    tagId = db.Column(db.Integer, db.ForeignKey("tag.id"), index=True)


class CatalogueTopic(Base):
    __tablename__ = "CatalogueTopic"
    catalogueId = db.Column(db.Integer, db.ForeignKey("catalogue.id"))
    topicId = db.Column(db.Integer, db.ForeignKey("topic.id"))


class Requirement(Base):
    key = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    parentId = db.Column(
        db.Integer,
        db.ForeignKey("topic.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    extras = db.relationship(
        "ExtraEntry",
        backref="requirement",
        lazy="joined",
        passive_deletes=True,
        cascade="all, delete",
    )

    tags = db.relationship(
        "Tag",
        secondary="RequirementTag",
        back_populates="requirement",
        passive_deletes=True,
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
        "Requirement", secondary="RequirementTag", passive_deletes=True
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
        db.ForeignKey("topic.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    parent = db.relationship(
        "Topic",
        remote_side=[id],
        backref="children",
        lazy="joined",
        passive_deletes=True,
        cascade="all, delete",
    )
    requirements = db.relationship(
        "Requirement",
        backref="parent",
        lazy="joined",
        passive_deletes=True,
        cascade="all, delete",
    )

    catalogues = db.relationship(
        "Catalogue", secondary="CatalogueTopic", passive_deletes=True
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
        db.ForeignKey("extra_type.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requirementId = db.Column(
        db.Integer,
        db.ForeignKey("requirement.id", ondelete="CASCADE"),
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
        passive_deletes=True,
        cascade="all, delete",
    )

    def __repr__(self):
        return f'<Catalogue "{self.title}">'


class Comment(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    comment = db.Column(db.Text)
    requirementId = db.Column(
        db.Integer,
        db.ForeignKey("requirement.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    author = db.Column(db.String(200), nullable=False)
    created = db.Column(db.DateTime(timezone=True), server_default=functions.now())
    completed = db.Column(db.Boolean, unique=False, default=False)

    def __repr__(self):
        return f'<Comment "{self.author}: {self.comment[:20]}">'
