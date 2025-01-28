
from fastapi import status

from api.error import ErrorResponses
from api.models.response import Response
from api.routers import AuthRouter

router = AuthRouter()


@router.get("/coffee", status_code=status.HTTP_418_IM_A_TEAPOT,
    responses={
        **ErrorResponses.forbidden,
        **ErrorResponses.unauthorized,
        418: {"description": "Not a coffeepot"},
    })
async def getCoffee() -> Response.TeePod:

    return Response.buildResponse(Response.TeePod, data="I'm a teapot", status=418)
