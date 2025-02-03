from typing import Annotated

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine

from api.config import AppConfig
from api.models.db import Audit, TableBase


class EntityBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)
    deleted: bool = Field(default=False)


def get_session():
    with Session(engine) as session:
        yield session


if AppConfig.DATABASE_URI.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(AppConfig.DATABASE_URI, connect_args=connect_args)
SessionDep = Annotated[Session, Depends(get_session)]


def audit(session: Session, action: int, model: TableBase, user: str):
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
