from typing import Generic, Optional, TypeVar, Union

from fastapi import Response as FastAPIResponse
from pydantic import BaseModel
from sqlmodel import SQLModel

from api.models.public import (
    Audit,
    Catalogue,
    Comment,
    Configuration,
    ExtraEntry,
    ExtraType,
    Requirement,
    StaticConfiguration,
    Tag,
    Topic,
    User,
)


class Pagination(BaseModel):
    offset: int
    limit: int
    count: int
    total: int


Data = TypeVar("Data")


class ResponseBase(BaseModel, Generic[Data]):
    status: int = 200
    data: Data


class Response:

    class Tag:

        class One(ResponseBase):
            data: Tag.Base

        class List(ResponseBase):
            data: list[Tag.Base]
            # page: Pagination

        class OneWithRequirementsAndCatalogues(ResponseBase):
            data: Tag.WithRequirementsAndCatalogues

        class ListWithRequirements(ResponseBase):
            data: list[Tag.WithRequirementsAndCatalogues]
            # page: Pagination

    class Configuration:

        class Dynamic:
            class One(ResponseBase):
                data: Configuration

            class List(ResponseBase):
                data: list[Configuration]
                # page: Pagination

        class Static(ResponseBase):
            data: StaticConfiguration

    class Catalogue:

        class One(ResponseBase):
            data: Catalogue.Base

        class List(ResponseBase):
            data: list[Catalogue.Base]
            # page: Pagination

        class OneWithTags(ResponseBase):
            data: Catalogue.WithTags

        class ListWithTags(ResponseBase):
            data: list[Catalogue.WithTags]
            # page: Pagination

        class ListWithTopics(ResponseBase):
            data: list[Catalogue.WithTopics]
            # page: Pagination

        class OneWithTopics(ResponseBase):
            data: Catalogue.WithTopics

        class OneWithTopicsAndRequirements(ResponseBase):
            data: Catalogue.WithTagsAndTopicsAndRequirements

        class OneWithTopicsAndRequirementsAndComments(ResponseBase):
            data: Catalogue.WithTagsAndTopicsAndRequirementsAndComments

        class ListWithTopicsAndRequirements(ResponseBase):
            data: list[Catalogue.WithTagsAndTopicsAndRequirements]
            # page: Pagination

        class ListWithTopicsAndRequirementsAndComments(ResponseBase):
            data: list[Catalogue.WithTagsAndTopicsAndRequirementsAndComments]
            # page: Pagination

    class Comment:

        class One(ResponseBase):
            data: Comment.WithRequirement

        class List(ResponseBase):
            data: list[Comment.WithRequirement]
            # page: Pagination

    class Topic:

        class One(ResponseBase):
            data: Topic.WithParent

        class List(ResponseBase):
            data: list[Topic.WithParent]
            # page: Pagination

        class OneWithRequirements(ResponseBase):
            data: Topic.WithChildrenAndRequirements

        class ListWithRequirements(ResponseBase):
            data: list[Topic.WithChildrenAndRequirements]
            # page: Pagination

    class Requirement:

        class One(ResponseBase):
            data: Requirement.WithExtrasAndTagsAndParent

        class List(ResponseBase):
            data: list[Requirement.WithExtrasAndTagsAndParent]
            # page: Pagination

        class OneWithComments(ResponseBase):
            data: Requirement.WithExtrasAndTagsAndCommentsAndParent

        class ListWithComments(ResponseBase):
            data: list[Requirement.WithExtrasAndTagsAndCommentsAndParent]
            # page: Pagination

    class ExtraType:

        class One(ResponseBase):
            data: ExtraType

        class List(ResponseBase):
            data: list[ExtraType]
            # page: Pagination

    class ExtraEntry:

        class One(ResponseBase):
            data: ExtraEntry.WithExtraTypeAndRequirement

        class List(ResponseBase):
            data: list[ExtraEntry.WithExtraTypeAndRequirement]
            # page: Pagination

    class Audit(ResponseBase):
        data: list[Audit]

    class TeePod(ResponseBase):
        data: str

    class User(ResponseBase):
        data: User

    class Export:
        class Jira:
            class Configuration(ResponseBase):
                data: list[Audit]

    class Error(ResponseBase):
        error: str
        message: list[dict] | str | dict

    class ErrorStr(ResponseBase):
        error: str
        message: str

    class ErrorStrList(ResponseBase):
        error: str
        message: list[str]

    @staticmethod
    def buildResponse(
        responseClass: ResponseBase.__class__, data: ResponseBase, status: int = 200
    ) -> FastAPIResponse:
        return FastAPIResponse(
            status_code=status,
            media_type="application/json",
            content=responseClass(status=status, data=data).model_dump_json(),
        )
