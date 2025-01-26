from datetime import datetime

from pydantic import ConfigDict
from sqlmodel import JSON, Column, Field, SQLModel


class UserBase(SQLModel):
    id: str = Field(primary_key=True)
    email: str = Field(max_length=254)
    created: float = Field(default=datetime.timestamp(datetime.now()))


class AuditBase(SQLModel):
    timestamp: float = Field(default=datetime.timestamp(datetime.now()))

    table: str = Field(max_length=200, index=True)
    target_id: int = Field(index=True)
    action: int
    data: dict = Field(default_factory=dict, sa_column=Column(JSON))

    userId: str = Field(foreign_key="user.id")


class TopicBase(SQLModel):
    key: str = Field(max_length=20, unique=True)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None)

    parentId: int | None = Field(foreign_key="topic.id", default=None, nullable=True)


class RequirementBase(SQLModel):
    key: str = Field(max_length=20, unique=True)
    title: str = Field(max_length=200)
    description: str
    visible: bool = Field(default=True)

    parentId: int = Field(foreign_key="topic.id", index=True, ondelete="CASCADE")


class CatalogueBase(SQLModel):
    title: str = Field(max_length=200)
    description: str | None = Field(default=None)


class CommentBase(SQLModel):
    comment: str
    created: float = Field(default=datetime.timestamp(datetime.now()))
    completed: bool = Field(default=False)

    requirementId: int = Field(foreign_key="requirement.id", ondelete="CASCADE")

    authorId: str = Field(foreign_key="user.id")


class ConfigurationBase(SQLModel):
    key: str = Field(primary_key=True, max_length=200)
    category: str = Field(max_length=200)
    value: str
    type: str = Field(max_length=50)
    description: str = Field(max_length=200)


class ExtraTypeBase(SQLModel):
    title: str = Field(max_length=200)
    description: str | None = Field(default=None)
    extraType: int


class ExtraEntryBase(SQLModel):
    content: str

    extraTypeId: int = Field(foreign_key="extra_type.id", ondelete="CASCADE")

    requirementId: int = Field(foreign_key="requirement.id", ondelete="CASCADE")


class TagBase(SQLModel):
    name: str = Field(max_length=50, unique=True)


class StaticConfiguration(SQLModel):
        class OAuthClass(SQLModel):
            provider: str
            authority: str
            client_id: str
        class MOTDClass(SQLModel):
            pre: str
            post: str
        class HomeClass(SQLModel):
            title: str
            MOTD: 'StaticConfiguration.MOTDClass'

        oauth: 'StaticConfiguration.OAuthClass'
        home: 'StaticConfiguration.HomeClass'
