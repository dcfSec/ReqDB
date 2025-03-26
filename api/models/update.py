from pydantic import ConfigDict
from sqlmodel import SQLModel


class Update:

    class Configuration(SQLModel):
        key: str | None = None
        value: str | None = None

    class CatalogueTopic(SQLModel):
        id: int

    class CatalogueTag(SQLModel):
        id: int

    class TagCatalogue(SQLModel):
        id: int

    class TagRequirement(SQLModel):
        id: int

    class RequirementTag(SQLModel):
        id: int

    class Tag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        name: str | None = None
        requirements: list["Update.TagRequirement"] = []
        catalogues: list["Update.TagCatalogue"] = []

    class Catalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str | None = None
        description: str | None = None
        topics: list["Update.CatalogueTopic"] | None = None
        tags: list["Update.CatalogueTag"] | None = None

    class Comment(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        comment: str | None = None
        completed: bool | None = None

    class Topic(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        key: str | None = None
        title: str | None = None
        description: str | None = None
        parentId: int | None = None

    class Requirement(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        key: str | None = None
        title: str | None = None
        description: str | None = None
        parentId: int | None = None
        tags: list["Update.RequirementTag"] | None = None

    class ExtraType(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str | None = None
        description: str | None = None
        extraType: int | None = None

    class ExtraEntry(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        content: str | None = None
        extraTypeId: int | None = None
        requirementId: int | None = None

    class User(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        notificationMailOnCommentChain: bool | None = None
        notificationMailOnRequirementComment: bool | None = None
