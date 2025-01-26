
from fastapi import status

from api.routers import AuthRouter

from ..models.response import Response

router = AuthRouter()


@router.get("/coffee", status_code=status.HTTP_418_IM_A_TEAPOT)
async def getCoffee() -> Response.TeePod:

    return Response.TeePod(status=418, data="I'm a teapot")
