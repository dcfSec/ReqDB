from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from api.models.base import (
    AuditBase,
    CatalogueBase,
    CommentBase,
    ConfigurationBase,
    ExtraEntryBase,
    ExtraTypeBase,
    RequirementBase,
    TagBase,
    TopicBase,
    UserBase,
)


class TableBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    deleted: bool = Field(default=False)


class RequirementTag(SQLModel, table=True):
    __tablename__ = "RequirementTag"
    requirementId: int = Field(foreign_key="requirement.id", primary_key=True)
    tagId: int = Field(foreign_key="tag.id", primary_key=True)


class CatalogueTopic(SQLModel, table=True):
    __tablename__ = "CatalogueTopic"
    catalogueId: int = Field(foreign_key="catalogue.id", primary_key=True)
    topicId: int = Field(foreign_key="topic.id", primary_key=True)


class User(UserBase, table=True):
    comments: list["Comment"] = Relationship(
        back_populates="author",
    )

    def __repr__(self):
        return f'<User "{self.id}">'


class Audit(AuditBase, SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user: User = Relationship()

    def __repr__(self):
        return f'<Audit "{self.verb}">'


class Topic(TopicBase, TableBase, table=True):
    parent: Optional["Topic"] | None = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Topic.id", "lazy": "joined"},
    )
    children: list["Topic"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"lazy": "joined"},
    )
    requirements: list["Requirement"] = Relationship(
        back_populates="parent",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "joined"},
    )
    catalogues: list["Catalogue"] = Relationship(
        back_populates="topics", link_model=CatalogueTopic
    )

    def __repr__(self):
        return f'<Topic "{self.title}">'


class Requirement(RequirementBase, TableBase, table=True):
    parent: Topic = Relationship(back_populates="requirements")

    tags: list["Tag"] = Relationship(
        back_populates="requirements",
        link_model=RequirementTag,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    extras: list["ExtraEntry"] = Relationship(
        back_populates="requirement",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    comments: list["Comment"] = Relationship(
        back_populates="requirement",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "joined", "order_by": "Comment.created"},
    )

    def __repr__(self):
        return f'<Requirement "{self.title}">'


class Catalogue(CatalogueBase, TableBase, table=True):
    topics: list["Topic"] = Relationship(
        back_populates="catalogues",
        link_model=CatalogueTopic,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    def __repr__(self):
        return f'<Catalogue "{self.title}">'


class Comment(CommentBase, TableBase, table=True):
    requirement: Requirement = Relationship(back_populates="comments")

    author: User = Relationship(
        back_populates="comments",
        sa_relationship_kwargs={"lazy": "joined"},
    )

    parent: Optional["Comment"] | None = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Comment.id", "lazy": "joined"},
    )

    children: list["Comment"] = Relationship(
        back_populates="parent",
        sa_relationship_kwargs={"lazy": "joined", "order_by": "Comment.created"},
        cascade_delete=True,
    )

    def __repr__(self):
        return f'<Comment "{self.author}: {self.comment[:20]}">'


class Configuration(ConfigurationBase, table=True):

    def __repr__(self):
        return f'<Configuration "{self.key}">'


class ExtraType(ExtraTypeBase, TableBase, table=True):
    __tablename__ = "extra_type"

    children: list["ExtraEntry"] = Relationship(
        back_populates="extraType",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    def __repr__(self):
        return f'<ExtraType "{self.title}">'


class ExtraEntry(ExtraEntryBase, TableBase, table=True):
    __tablename__ = "extra_entry"

    extraType: ExtraType = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"lazy": "joined"},
    )
    requirement: Requirement = Relationship(back_populates="extras")

    def __repr__(self):
        return f'<ExtraEntry "{self.content[:20]}">'


class Tag(TagBase, TableBase, table=True):
    requirements: list["Requirement"] = Relationship(
        back_populates="tags", link_model=RequirementTag
    )

    def __repr__(self):
        return f'<Tag "{self.name}">'
