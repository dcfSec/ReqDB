from pydantic import ConfigDict
from sqlmodel import SQLModel


class Insert:
    class Tag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        name: str
        catalogues: list["Insert.TagCatalogue"] = []
        requirements: list["Insert.TagRequirement"] = []

    class Catalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str
        description: str = ""
        topics: list["Insert.CatalogueTopic"] = []
        tags: list["Insert.RequirementTag"] = []

    class Comment(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        comment: str
        completed: bool = False
        requirementId: int
        authorId: str
        parentId: int

    class Topic(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        key: str
        title: str
        description: str = ""
        parentId: int | None = None

    class Requirement(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        key: str
        title: str
        description: str
        parentId: int
        visible: bool = True
        tags: list["Insert.RequirementTag"] = []

    class ExtraType(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        title: str
        description: str = ""
        extraType: int

    class ExtraEntry(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        content: str
        extraTypeId: int
        requirementId: int

    class CatalogueTopic(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        id: int

    class RequirementTag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        id: int

    class CatalogueTag(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        id: int

    class TagCatalogue(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        id: int

    class TagRequirement(SQLModel):
        model_config = ConfigDict(from_attributes=True)
        id: int