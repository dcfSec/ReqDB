from __future__ import annotations

from sqlalchemy.orm import Mapped, relationship
from sqlmodel import Field, Relationship, SQLModel, inspect

from api.models.base import (
    AuditBase,
    CatalogueBase,
    CommentBase,
    ConfigurationBase,
    ExtraEntryBase,
    ExtraTypeBase,
    RequirementBase,
    TagBase,
    TokenBase,
    TopicBase,
    UserBase,
)


def getModelTable(model):
    ins = inspect(model)
    table = getattr(ins, "local_table")
    return table


def SARelationship(**kwargs):
    return Relationship(sa_relationship=relationship(**kwargs))


class TableBase(SQLModel):
    id: int = Field(default=None, primary_key=True)
    deleted: bool = Field(default=False)


class CatalogueTag(SQLModel, table=True):
    __tablename__ = "CatalogueTag"  # type: ignore
    catalogueId: int = Field(foreign_key="catalogue.id", primary_key=True)
    tagId: int = Field(foreign_key="tag.id", primary_key=True)


class RequirementTag(SQLModel, table=True):
    __tablename__ = "RequirementTag"  # type: ignore
    requirementId: int = Field(foreign_key="requirement.id", primary_key=True)
    tagId: int = Field(foreign_key="tag.id", primary_key=True)


class CatalogueTopic(SQLModel, table=True):
    __tablename__ = "CatalogueTopic"  # type: ignore
    catalogueId: int = Field(foreign_key="catalogue.id", primary_key=True)
    topicId: int = Field(foreign_key="topic.id", primary_key=True)


class User(UserBase, table=True):
    comments: Mapped[list[Comment]] = SARelationship(
        back_populates="author",
    )
    tokens: Mapped[list[Token]] = SARelationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f'<User "{self.id}">'


class Token(TokenBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user: User = SARelationship(
        back_populates="tokens",
        lazy="joined",
    )

    def __repr__(self):
        return f'<Token "{self.id}">'


class Audit(AuditBase, SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user: User = Relationship()

    def __repr__(self):
        return f'<Audit "{self.action}">'


class Topic(TopicBase, TableBase, table=True):
    parent: Mapped[Topic | None] = SARelationship(
        back_populates="children",
        remote_side="Topic.id",
        lazy="joined",
    )
    children: Mapped[list[Topic]] = SARelationship(
        back_populates="parent",
        lazy="joined",
    )
    requirements: Mapped[list[Requirement]] = SARelationship(
        back_populates="parent",
        cascade="all, delete-orphan",
        lazy="joined",
    )
    catalogues: Mapped[list[Catalogue]] = SARelationship(
        back_populates="topics", secondary=getModelTable(CatalogueTopic)
    )

    def __repr__(self):
        return f'<Topic "{self.title}">'


class Requirement(RequirementBase, TableBase, table=True):
    parent: Topic = Relationship(back_populates="requirements")

    tags: Mapped[list[Tag]] = SARelationship(
        back_populates="requirements",
        secondary=getModelTable(RequirementTag),
        lazy="joined",
    )

    extras: Mapped[list[ExtraEntry]] = SARelationship(
        back_populates="requirement",
        cascade="all, delete-orphan",
        lazy="joined",
    )

    comments: Mapped[list[Comment]] = SARelationship(
        back_populates="requirement",
        cascade="all, delete-orphan",
        order_by="Comment.created",
        lazy="joined",
    )

    def __repr__(self):
        return f'<Requirement "{self.title}">'


class Catalogue(CatalogueBase, TableBase, table=True):
    topics: Mapped[list[Topic]] = SARelationship(
        back_populates="catalogues",
        secondary=getModelTable(CatalogueTopic),
        lazy="joined",
    )

    tags: Mapped[list[Tag]] = SARelationship(
        back_populates="catalogues",
        secondary=getModelTable(CatalogueTag),
        lazy="joined",
    )

    def __repr__(self):
        return f'<Catalogue "{self.title}">'


class Comment(CommentBase, TableBase, table=True):
    requirement: Requirement = Relationship(back_populates="comments")

    author: User = Relationship(
        back_populates="comments",
        sa_relationship_kwargs={"lazy": "joined"},
    )

    parent: Mapped[Comment | None] = SARelationship(
        back_populates="children",
        remote_side="Comment.id",
        lazy="joined",
    )

    children: Mapped[list[Comment]] = SARelationship(
        back_populates="parent",
        order_by="Comment.created",
        lazy="joined",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f'<Comment "{self.author}: {self.comment[:20]}">'


class Configuration(ConfigurationBase, table=True):

    def __repr__(self):
        return f'<Configuration "{self.key}">'


class ExtraType(ExtraTypeBase, TableBase, table=True):
    __tablename__ = "extra_type"  # type: ignore

    children: Mapped[list[ExtraEntry]] = SARelationship(
        back_populates="extraType",
        lazy="joined",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f'<ExtraType "{self.title}">'


class ExtraEntry(ExtraEntryBase, TableBase, table=True):
    __tablename__ = "extra_entry"  # type: ignore

    extraType: ExtraType = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"lazy": "joined"},
    )
    requirement: Requirement = Relationship(back_populates="extras")

    def __repr__(self):
        return f'<ExtraEntry "{self.content[:20]}">'


class Tag(TagBase, TableBase, table=True):
    requirements: Mapped[list[Requirement]] = SARelationship(
        back_populates="tags",
        secondary=getModelTable(RequirementTag),
    )
    catalogues: Mapped[list[Catalogue]] = SARelationship(
        back_populates="tags",
        secondary=getModelTable(CatalogueTag),
        lazy="joined",
    )

    def __repr__(self):
        return f'<Tag "{self.name}">'
