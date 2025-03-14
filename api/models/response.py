from typing import Union

from fastapi import Response as FastAPIResponse
from pydantic import BaseModel

from api.models.public import Audit, Catalogue, CatalogueWithTopics
from api.models.public import (
    CatalogueWithTopicsAndRequirements as CatalogueWithTopicsAndRequirementsModel,
)
from api.models.public import (
    CatalogueWithTopicsAndRequirementsAndComments as CatalogueWithTopicsAndRequirementsAndCommentsModel,
)
from api.models.public import (
    CommentWithRequirement,
    Configuration,
    ExtraEntryWithExtraTypeAndRequirement,
    ExtraType,
    RequirementWithExtrasAndTagsAndComments,
    Tag,
    TagWithRequirements,
    TopicWithParent,
    TopicWithRequirements,
    StaticConfiguration,
    User,
)


class ResponseBase(BaseModel):
    status: int = 200

class Response:
    class Configuration(ResponseBase):
        data: list[Configuration]
        
    class StaticConfiguration(ResponseBase):
        data: StaticConfiguration

    class TagWithRequirements(ResponseBase):
        data: TagWithRequirements

    class TagsWithRequirements(ResponseBase):
        data:  list[TagWithRequirements]

    class Tag(ResponseBase):
        data: Tag

    class Tags(ResponseBase):
        data: list[Tag]

    class CatalogueWithTopics(ResponseBase):
        data:CatalogueWithTopics

    class CatalogueWithTopicsAndRequirements(ResponseBase):
        data: CatalogueWithTopicsAndRequirementsModel

    class CatalogueWithTopicsAndRequirementsAndComments(ResponseBase):
        data: CatalogueWithTopicsAndRequirementsAndCommentsModel

    class Catalogue(ResponseBase):
        data: Catalogue

    class CataloguesWithTopics(ResponseBase):
        data: list[CatalogueWithTopics]

    class CataloguesWithTopicsAndRequirements(ResponseBase):
        data: list[CatalogueWithTopicsAndRequirementsModel]

    class CataloguesWithTopicsAndRequirementsAndComments(ResponseBase):
        data: list[CatalogueWithTopicsAndRequirementsAndCommentsModel]

    class Catalogues(ResponseBase):
        data: list[Catalogue]

    class Comment(ResponseBase):
        data:CommentWithRequirement
    
    class Comments(ResponseBase):
        data: list[CommentWithRequirement]

    class Topic(ResponseBase):
        data: TopicWithParent

    class TopicWithRequirements(ResponseBase):
        data: TopicWithRequirements

    class Topics(ResponseBase):
        data: list[TopicWithParent]

    class TopicsWithRequirements(ResponseBase):
        data: list[TopicWithRequirements]

    class Requirement(ResponseBase):
        data: RequirementWithExtrasAndTagsAndComments

    class Requirements(ResponseBase):
        data: list[RequirementWithExtrasAndTagsAndComments]

    class ExtraType(ResponseBase):
        data: ExtraType

    class ExtraTypes(ResponseBase):
        data: list[ExtraType]

    class ExtraEntry(ResponseBase):
        data: ExtraEntryWithExtraTypeAndRequirement

    class ExtraEntries(ResponseBase):
        data: ExtraEntryWithExtraTypeAndRequirement
 
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


