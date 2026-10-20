from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

class Todo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    done: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    time_to_complete: int | None = None
    severity: str | None = None

class TodoCreate(SQLModel):
    title: str
    time_to_complete: int | None = None
    severity: str | None = None

class TodoUpdate(SQLModel):
    title: str | None = None
    done: bool | None = None
    time_to_complete: int | None = None
    severity: str | None = None