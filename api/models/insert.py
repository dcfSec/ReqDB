from pydantic import ConfigDict
from sqlmodel import SQLModel


class Insert:
    class Tag(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        name: str
        catalogues: list["Insert.TagCatalogue"] = []
        requirements: list["Insert.TagRequirement"] = []

    class Catalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        key: str
        title: str
        description: str = ""
        topics: list["Insert.CatalogueTopic"] = []
        tags: list["Insert.RequirementTag"] = []

    class Comment(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        comment: str
        completed: bool = False
        requirementId: int
        authorId: str = ""
        parentId: int | None = None

    class Topic(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        key: str
        title: str
        description: str = ""
        parentId: int | None = None

    class Requirement(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        key: str
        title: str
        description: str
        parentId: int
        visible: bool = True
        tags: list["Insert.RequirementTag"] = []

    class ExtraType(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        title: str
        description: str = ""
        extraType: int

    class ExtraEntry(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        content: str
        extraTypeId: int
        requirementId: int

    class CatalogueTopic(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        id: int

    class RequirementTag(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        id: int

    class CatalogueTag(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        id: int

    class TagCatalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        id: int

    class TagRequirement(SQLModel):
        model_config = ConfigDict(from_attributes=True)  # type: ignore
        id: int
