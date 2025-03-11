from typing import Optional
from pydantic import computed_field

from api.models.base import (
    AuditBase,
    CatalogueBase,
    CommentBase,
    ExtraEntryBase,
    ExtraTypeBase,
    RequirementBase,
    TagBase,
    TopicBase,
    UserBase,
    ConfigurationBase,
    StaticConfiguration as StaticConfigurationBase
)


class Tag(TagBase):
    id: int

class Catalogue(CatalogueBase):
    id: int


class Topic(TopicBase):
    id: int

class TopicWithParent(TopicBase):
    id: int
    parent: Optional["TopicWithParent"] = None

class Requirement(RequirementBase):
    id: int

class ExtraType(ExtraTypeBase):
    id: int

class ExtraEntry(ExtraEntryBase):
    id: int

class User(UserBase):
    pass

class Comment(CommentBase):
    id: int
    author: User
    children: list["Comment"] | None = []

class CommentWithRequirement(Comment):
    author: User
    requirement: Requirement

class ExtraEntryWithExtraType(ExtraEntry):
    extraType: ExtraType

class ExtraEntryWithExtraTypeAndRequirement(ExtraEntry):
    extraType: ExtraType
    requirement: Requirement

class TagWithRequirements(Tag):
    requirements: list[Requirement] | None = []

class RequirementWithExtrasAndTags(Requirement):
    extras: list[ExtraEntryWithExtraType] | None = []
    tags: list[Tag] | None = []

class RequirementWithExtrasAndTagsAndTopics(Requirement):
    extras: list[ExtraEntryWithExtraType] | None = []
    tags: list[Tag] | None = []
    parent: TopicWithParent | None = []

class RequirementWithExtrasAndTagsAndComments(Requirement):
    extras: list[ExtraEntryWithExtraType] | None = []
    tags: list[Tag] | None = []
    comments:  list[Comment] | None = []
    parent: TopicWithParent | None = []

class TopicWithRequirements(Topic):
    children: list["TopicWithRequirements"] | None = []
    requirements: list[RequirementWithExtrasAndTags] | None = []

class TopicWithRequirementsAndComments(Topic):
    children: list["TopicWithRequirementsAndComments"] | None = []
    requirements: list[RequirementWithExtrasAndTagsAndComments] | None = []


class CatalogueWithTopics(Catalogue):
    topics: list[Topic] | None = []

class CatalogueWithTopicsAndRequirements(Catalogue):
    topics: list[TopicWithRequirements] | None = []

class CatalogueWithTopicsAndRequirementsAndComments(Catalogue):
    topics: list[TopicWithRequirementsAndComments] | None = []

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