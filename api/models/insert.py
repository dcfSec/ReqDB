from pydantic import ConfigDict
from sqlmodel import SQLModel


class Insert:
    class Tag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        name: str | None = None

    class Catalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str | None = None
        description: str | None = None
        topics: list["Insert.CatalogueTopic"] = []

    class Comment(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        comment: str | None = None
        completed: bool = False
        requirementId: int
        authorId: str | None = None
        parentId: int | None = None

    class Topic(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        key: str | None = None
        title: str | None = None
        description: str | None = None
        parentId: int | None = None

    class Requirement(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        key: str
        title: str
        description: str
        parentId: int
        visible: bool = True

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

    class CatalogueTopic(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        id: int
