from pydantic import BaseModel


class UserInfo(BaseModel):
    sub: str
    email: str
    roles: list[str]


class Token(BaseModel):
    access_token: str
    refresh_token: str
    id_token: str
    expires_at: int
    userinfo: UserInfo
