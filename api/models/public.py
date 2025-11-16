from __future__ import annotations

from pydantic import computed_field
from sqlmodel import SQLModel

from api.models.base import (
    AuditBase,
    CatalogueBase,
    CommentBase,
    ConfigurationBase,
    ExtraEntryBase,
    ExtraTypeBase,
    RequirementBase,
)
from api.models.base import StaticConfiguration as StaticConfigurationBase
from api.models.base import TagBase, TopicBase, UserBase


class User(UserBase):
    atlassianCloudActive: bool = False


class Audit(AuditBase):
    id: int
    user: User

    @computed_field
    @property
    def verb(self) -> str:
        return ["INSERT", "UPDATE", "DELETE"][self.action]


class Configuration(ConfigurationBase):
    pass


class StaticConfiguration(StaticConfigurationBase):
    pass


class ExtraType(ExtraTypeBase):
    id: int


class Tag:
    class Base(TagBase):
        id: int

    class WithRequirementsAndCatalogues(Base):
        requirements: list["Requirement.Base"] | None = []
        catalogues: list["Catalogue.Base"] | None = []


class Topic:
    class Base(TopicBase):
        id: int

    class WithParent(Base):
        parent: Topic.WithParent | None = None

    class WithChildrenAndRequirements(Base):
        children: list["Topic.WithChildrenAndRequirements"] | None = []
        requirements: list["Requirement.WithExtrasAndTags"] | None = []

    class WithChildrenAndRequirementsAndComments(Base):
        children: list["Topic.WithChildrenAndRequirementsAndComments"] | None = []
        requirements: list["Requirement.WithExtrasAndTagsAndComments"] | None = []


class Catalogue:
    class Base(CatalogueBase):
        id: int

    class WithTopics(Base):
        topics: list[Topic.Base] | None = []
        tags: list[Tag.Base] | None = []

    class WithTags(Base):
        tags: list[Tag.Base] | None = []

    class WithTagsAndTopicsAndRequirements(Base):
        topics: list[Topic.WithChildrenAndRequirements] | None = []
        tags: list[Tag.Base] | None = []

    class WithTagsAndTopicsAndRequirementsAndComments(Base):
        topics: list[Topic.WithChildrenAndRequirementsAndComments] | None = []
        tags: list[Tag.Base] | None = []


class Comment:
    class Base(CommentBase):
        id: int
        author: User
        children: list["Base"] | None = []  # type: ignore

    class WithRequirement(Base):
        author: User
        requirement: "Requirement.Base"


class Requirement:
    class Base(RequirementBase):
        id: int

    class WithExtras(Base):
        extras: list["ExtraEntry.WithExtraType"] | None = []

    class WithComments(Base):
        comments: list["Comment.Base"] | None = []

    class WithTags(Base):
        tags: list[Tag.Base] | None = []

    class WithParent(Base):
        parent: Topic.WithParent

    class WithExtrasAndTags(WithExtras, WithTags):
        pass

    class WithExtrasAndTagsAndComments(WithExtras, WithTags, WithComments):
        pass

    class WithExtrasAndTagsAndParent(WithExtras, WithTags, WithParent):
        pass

    class WithExtrasAndTagsAndCommentsAndParent(
        WithExtras, WithTags, WithComments, WithParent
    ):
        pass


class ExtraEntry:
    class Base(ExtraEntryBase):
        id: int

    class WithExtraType(Base):
        extraType: ExtraType

    class WithRequirement(Base):
        requirement: "Requirement.Base"

    class WithExtraTypeAndRequirement(WithExtraType, WithRequirement):
        pass


class Export:
    class Jira:
        class Token(SQLModel):
            name: str
            token_type: str
            access_token: str
            expires_at: int

        class IssueType(SQLModel):
            name: str
            icon: str

        class RedirectLocation(SQLModel):
            location: str

        class Configuration(SQLModel):
            tenant: str
            user: str
            enabled: bool
