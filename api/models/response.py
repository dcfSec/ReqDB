from typing import Union

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


class ResponseBase(BaseModel):
    status: int = 200

class Response:
    class Configuration(ResponseBase):
        data: list[Configuration]
        
    class StaticConfiguration(ResponseBase):
        data: StaticConfiguration

    class TagWithRequirementsAndCatalogues(ResponseBase):
        data: Tag.WithRequirementsAndCatalogues

    class TagsWithRequirements(ResponseBase):
        data:  list[Tag.WithRequirementsAndCatalogues]

    class Tag(ResponseBase):
        data: Tag.Base

    class Tags(ResponseBase):
        data: list[Tag.Base]

    class CatalogueWithTopics(ResponseBase):
        data: Catalogue.WithTopics

    class CatalogueWithTopicsAndRequirements(ResponseBase):
        data: Catalogue.WithTagsAndTopicsAndRequirements

    class CatalogueWithTopicsAndRequirementsAndComments(ResponseBase):
        data: Catalogue.WithTagsAndTopicsAndRequirementsAndComments

    class Catalogue(ResponseBase):
        data: Catalogue.Base

    class CatalogueWithTags(ResponseBase):
        data: list[Catalogue.WithTags]

    class CataloguesWithTopics(ResponseBase):
        data: list[Catalogue.WithTopics]

    class CataloguesWithTopicsAndRequirements(ResponseBase):
        data: list[Catalogue.WithTagsAndTopicsAndRequirements]

    class CataloguesWithTopicsAndRequirementsAndComments(ResponseBase):
        data: list[Catalogue.WithTagsAndTopicsAndRequirementsAndComments]

    class Catalogues(ResponseBase):
        data: list[Catalogue.Base]

    class Comment(ResponseBase):
        data: Comment.WithRequirement
    
    class Comments(ResponseBase):
        data: list[Comment.WithRequirement]

    class Topic(ResponseBase):
        data: Topic.WithParent

    class TopicWithRequirements(ResponseBase):
        data: Topic.WithChildrenAndRequirements

    class Topics(ResponseBase):
        data: list[Topic.WithParent]

    class TopicsWithRequirements(ResponseBase):
        data: list[Topic.WithChildrenAndRequirements]

    class Requirement(ResponseBase):
        data: Requirement.WithExtrasAndTagsAndParent

    class RequirementWithComments(ResponseBase):
        data: Requirement.WithExtrasAndTagsAndCommentsAndParent

    class Requirements(ResponseBase):
        data: list[Requirement.WithExtrasAndTagsAndParent]

    class RequirementsWithComments(ResponseBase):
        data: list[Requirement.WithExtrasAndTagsAndCommentsAndParent]

    class ExtraType(ResponseBase):
        data: ExtraType

    class ExtraTypes(ResponseBase):
        data: list[ExtraType]

    class ExtraEntry(ResponseBase):
        data: ExtraEntry.WithExtraTypeAndRequirement

    class ExtraEntries(ResponseBase):
        data: list[ExtraEntry.WithExtraTypeAndRequirement]
 
    class Audit(ResponseBase):
        data: list[Audit]
    
    class TeePod(ResponseBase):
        data: str
    
    class User(ResponseBase):
        data: User

    class Error(ResponseBase):
        error: str
        message: Union[list[dict],str,dict]
        
    class ErrorStr(ResponseBase):
        error: str
        message: str

    class ErrorStrList(ResponseBase):
        error: str
        message: list[str]

    @staticmethod
    def buildResponse(responseClass: ResponseBase.__class__, data: ResponseBase, status: int = 200):
        return FastAPIResponse(status_code=status, media_type='application/json', content=responseClass(status=status, data=data).model_dump_json())

class ResponseUpdate:
    class Configuration(ResponseBase):
        data: Configuration


