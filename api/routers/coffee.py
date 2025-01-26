
from fastapi import status

from api.models.response import Response
from api.routers import AuthRouter

router = AuthRouter()


@router.get("/coffee", status_code=status.HTTP_418_IM_A_TEAPOT)
async def getCoffee() -> Response.TeePod:

    return Response.TeePod(status=418, data="I'm a teapot")
