from typing import Union

from pydantic import BaseModel

from api.models.base import StaticConfiguration
from api.models.db import Configuration
from api.models.public import (
    Audit,
    Catalogue,
    CatalogueWithTopics,
    CatalogueWithTopicsAndRequirements,
    CatalogueWithTopicsAndRequirementsAndComments,
    CommentWithRequirement,
    ExtraEntryWithExtraTypeAndRequirement,
    ExtraType,
    RequirementWithExtrasAndTagsAndComments,
    Tag,
    TagWithRequirements,
    TopicWithParent,
    TopicWithRequirements,
)


class ResponseBase(BaseModel):
    status: int = 200

class Response:
    class Configuration(ResponseBase):
        data: list[Configuration]
        
    class StaticConfiguration(ResponseBase):
        data: StaticConfiguration

    class TagWithRequirements(ResponseBase):
        data:  Union[list[TagWithRequirements], TagWithRequirements]

    class Tag(ResponseBase):
        data: Union[list[Tag],Tag]

    class CatalogueWithTopics(ResponseBase):
        data: Union[list[CatalogueWithTopics],CatalogueWithTopics]

    class CatalogueWithTopicsAndRequirements(ResponseBase):
        data: Union[list[CatalogueWithTopicsAndRequirements],CatalogueWithTopicsAndRequirements]

    class CatalogueWithTopicsAndRequirementsAndComments(ResponseBase):
        data: Union[list[CatalogueWithTopicsAndRequirementsAndComments],CatalogueWithTopicsAndRequirementsAndComments]

    class Catalogue(ResponseBase):
        data: Union[list[Catalogue],Catalogue]

    class Comment(ResponseBase):
        data: Union[list[CommentWithRequirement],CommentWithRequirement]
    
    class Topic(ResponseBase):
        data: Union[list[TopicWithParent],TopicWithParent]

    class TopicWithRequirements(ResponseBase):
        data: Union[list[TopicWithRequirements],TopicWithRequirements]

    class Requirement(ResponseBase):
        data: Union[list[RequirementWithExtrasAndTagsAndComments],RequirementWithExtrasAndTagsAndComments]

    class ExtraType(ResponseBase):
        data: Union[list[ExtraType],ExtraType]

    class ExtraEntry(ResponseBase):
        data: Union[list[ExtraEntryWithExtraTypeAndRequirement],ExtraEntryWithExtraTypeAndRequirement]
    
    class Audit(ResponseBase):
        data: Union[list[Audit],Audit]
    
    class TeePod(ResponseBase):
        data: str

    class Error(ResponseBase):
        error: str
        message: Union[list[dict],str,dict]
        
    class ErrorStr(ResponseBase):
        error: str
        message: str

    class ErrorStrList(ResponseBase):
        error: str
        message: list[str]

class ResponseUpdate:
    class Configuration(ResponseBase):
        data: Configuration


