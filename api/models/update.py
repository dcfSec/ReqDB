from pydantic import ConfigDict
from sqlmodel import SQLModel

from api.models.base import RequirementBase, TopicBase


class Update:
    class Tag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        name: str | None = None
        requirements: list[RequirementBase] | None = None

    class Configuration(SQLModel):
        key: str | None = None
        value: str | None = None

    class CatalogueTopic(SQLModel):
        id: int

    class Catalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str | None = None
        description: str | None = None
        topics: list["Update.CatalogueTopic"] | None = None

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
