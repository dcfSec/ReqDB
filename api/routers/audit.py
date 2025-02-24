from typing import Annotated

from fastapi import Depends, status
from sqlmodel import desc, select

from api.error import Forbidden, NotFound, ErrorResponses
from api.models import SessionDep
from api.models.db import (
    Audit,
    Catalogue,
    Comment,
    ExtraEntry,
    ExtraType,
    Requirement,
    Tag,
    Topic,
)
from api.models.response import Response
from api.routers import AuthRouter, getRoles

router = AuthRouter()


@router.get(
    "/audit/{object}",
    status_code=status.HTTP_200_OK,
    responses={
        **ErrorResponses.notFound,
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        **ErrorResponses.unprocessable,
        200: {"description": "Audit logs for the requested object"},
    },
)
async def getAudit(
    session: SessionDep,
    object: str,
    roles: Annotated[dict, Depends(getRoles)],
) -> Response.Audit:

    modelMapping = {
        "extraEntries": (ExtraEntry, "Requirements.Auditor"),
        "extraTypes": (ExtraType, "Requirements.Auditor"),
        "requirements": (Requirement, "Requirements.Auditor"),
        "tags": (Tag, "Requirements.Auditor"),
        "topics": (Topic, "Requirements.Auditor"),
        "catalogues": (Catalogue, "Requirements.Auditor"),
        "comments": (Comment, "Comments.Auditor"),
    }

    if object not in modelMapping.keys():
        raise NotFound(detail="Audit object not found")

    if modelMapping[object][1] not in roles:
        raise Forbidden(detail="Forbidden")

    statement = (
        select(Audit)
        .where(Audit.table == modelMapping[object][0].__tablename__)
        .order_by(desc(Audit.timestamp))
    )
    data = session.exec(statement)

    return Response.buildResponse(Response.Audit, data)
