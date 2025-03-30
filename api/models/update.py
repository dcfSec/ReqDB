from pydantic import ConfigDict
from sqlmodel import SQLModel


class Update:

    class Configuration(SQLModel):
        key: str | None = None
        value: str | None = None

    class TopicIdOnly(SQLModel):
        id: int

    class TagIdOnly(SQLModel):
        id: int

    class CatalogueIdOnly(SQLModel):
        id: int

    class RequirementIdOnly(SQLModel):
        id: int

    class Tag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        name: str | None = None
        requirements: list["Update.RequirementIdOnly"] = []
        catalogues: list["Update.CatalogueIdOnly"] = []

    class Catalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str | None = None
        description: str | None = None
        topics: list["Update.TopicIdOnly"] | None = None
        tags: list["Update.TagIdOnly"] | None = None

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
        tags: list["Update.TagIdOnly"] | None = None

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
