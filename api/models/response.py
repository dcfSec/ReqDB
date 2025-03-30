from typing import Optional, Union

from fastapi import Response as FastAPIResponse
from pydantic import BaseModel

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


class ResponseBase(BaseModel):
    status: int = 200
    _page: Optional[Pagination]


class Response:

    class Tag:

        class One(ResponseBase):
            data: Tag.Base

        class List(ResponseBase):
            data: list[Tag.Base]

        class OneWithRequirementsAndCatalogues(ResponseBase):
            data: Tag.WithRequirementsAndCatalogues

        class ListWithRequirements(ResponseBase):
            data: list[Tag.WithRequirementsAndCatalogues]

    class Configuration:

        class Dynamic:
            class One(ResponseBase):
                data: Configuration

            class List(ResponseBase):
                data: list[Configuration]

        class Static(ResponseBase):
            data: StaticConfiguration

    class Catalogue:

        class One(ResponseBase):
            data: Catalogue.Base

        class List(ResponseBase):
            data: list[Catalogue.Base]

        class OneWithTags(ResponseBase):
            data: Catalogue.WithTags

        class ListWithTags(ResponseBase):
            data: list[Catalogue.WithTags]

        class ListWithTopics(ResponseBase):
            data: list[Catalogue.WithTopics]

        class OneWithTopics(ResponseBase):
            data: Catalogue.WithTopics

        class OneWithTopicsAndRequirements(ResponseBase):
            data: Catalogue.WithTagsAndTopicsAndRequirements

        class OneWithTopicsAndRequirementsAndComments(ResponseBase):
            data: Catalogue.WithTagsAndTopicsAndRequirementsAndComments

        class ListWithTopicsAndRequirements(ResponseBase):
            data: list[Catalogue.WithTagsAndTopicsAndRequirements]

        class ListWithTopicsAndRequirementsAndComments(ResponseBase):
            data: list[Catalogue.WithTagsAndTopicsAndRequirementsAndComments]

    class Comment:

        class One(ResponseBase):
            data: Comment.WithRequirement

        class List(ResponseBase):
            data: list[Comment.WithRequirement]

    class Topic:

        class One(ResponseBase):
            data: Topic.WithParent

        class List(ResponseBase):
            data: list[Topic.WithParent]

        class OneWithRequirements(ResponseBase):
            data: Topic.WithChildrenAndRequirements

        class ListWithRequirements(ResponseBase):
            data: list[Topic.WithChildrenAndRequirements]

    class Requirement:

        class One(ResponseBase):
            data: Requirement.WithExtrasAndTagsAndParent

        class List(ResponseBase):
            data: list[Requirement.WithExtrasAndTagsAndParent]

        class OneWithComments(ResponseBase):
            data: Requirement.WithExtrasAndTagsAndCommentsAndParent

        class ListWithComments(ResponseBase):
            data: list[Requirement.WithExtrasAndTagsAndCommentsAndParent]

    class ExtraType:

        class One(ResponseBase):
            data: ExtraType

        class List(ResponseBase):
            data: list[ExtraType]

    class ExtraEntry:

        class One(ResponseBase):
            data: ExtraEntry.WithExtraTypeAndRequirement

        class List(ResponseBase):
            data: list[ExtraEntry.WithExtraTypeAndRequirement]

    class Audit(ResponseBase):
        data: list[Audit]

    class TeePod(ResponseBase):
        data: str

    class User(ResponseBase):
        data: User

    class Error(ResponseBase):
        error: str
        message: Union[list[dict], str, dict]

    class ErrorStr(ResponseBase):
        error: str
        message: str

    class ErrorStrList(ResponseBase):
        error: str
        message: list[str]

    @staticmethod
    def buildResponse(
        responseClass: ResponseBase.__class__, data: ResponseBase, status: int = 200
    ):
        return FastAPIResponse(
            status_code=status,
            media_type="application/json",
            content=responseClass(status=status, data=data).model_dump_json(),
        )
