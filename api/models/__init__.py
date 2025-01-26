from typing import Annotated

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine

from api.models.db import Audit

from ..config import AppConfig


class EntityBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    deleted: bool = Field(default=False)


def get_session():
    with Session(engine) as session:
        yield session


connect_args = {"check_same_thread": False}
engine = create_engine(AppConfig.DATABASE_URI, connect_args=connect_args)
SessionDep = Annotated[Session, Depends(get_session)]


def audit(session, action, model, user):
    session.add(
        Audit(
            userId=user,
            table=model.__tablename__,
            target_id=model.id,
            action=action,
            data=model.model_dump(mode="json") if action != 2 else {},
        )
    )
    session.commit()
