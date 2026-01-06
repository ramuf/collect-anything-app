from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship, Column
import sqlalchemy as sa
try:
    from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
except Exception:
    JSONB = None
    PG_UUID = None

# Use JSONB for Postgres (better indexing/querying), fall back to JSON for other databases.
JSON_TYPE = JSONB if JSONB else sa.JSON

# Use native Postgres UUID type when available, otherwise fall back to a
# fixed-length string (36 chars) to store UUIDs as text.
UUID_SQLA_TYPE = PG_UUID(as_uuid=True) if PG_UUID else sa.String(36)


def uuid_pk_column() -> Any:
    """Create a primary key UUID column."""
    return Column(UUID_SQLA_TYPE, primary_key=True, default=uuid4)  # type: ignore[arg-type]


def uuid_fk_column(foreign_key: str) -> Any:
    """Create a foreign key UUID column."""
    return Column(UUID_SQLA_TYPE, sa.ForeignKey(foreign_key), nullable=False)  # type: ignore[arg-type]


def json_column(default_factory: Any = dict) -> Any:
    """Create a JSON column with a default factory."""
    return Column(JSON_TYPE, default=default_factory, nullable=False)


class User(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, sa_column=uuid_pk_column())
    email: str = Field(index=True, unique=True)
    hashed_password: str
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    projects: List["Project"] = Relationship(back_populates="owner")


class Project(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, sa_column=uuid_pk_column())
    title: str
    description: Optional[str] = None
    owner_id: UUID = Field(sa_column=uuid_fk_column("user.id"))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    settings: Dict[str, Any] = Field(default_factory=dict, sa_column=json_column(dict))
    
    owner: User = Relationship(back_populates="projects")
    forms: List["Form"] = Relationship(
        back_populates="project",
        cascade_delete=True,
    )
    views: List["View"] = Relationship(
        back_populates="project",
        cascade_delete=True,
    )


class Form(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, sa_column=uuid_pk_column())
    project_id: UUID = Field(sa_column=uuid_fk_column("project.id"))
    title: str
    description: Optional[str] = None
    slug: str
    schema_: List[Dict[str, Any]] = Field(default_factory=list, sa_column=json_column(list))
    settings: Dict[str, Any] = Field(default_factory=dict, sa_column=json_column(dict))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    project: Project = Relationship(back_populates="forms")
    submissions: List["Submission"] = Relationship(
        back_populates="form",
        cascade_delete=True,
    )


class Submission(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, sa_column=uuid_pk_column())
    form_id: UUID = Field(sa_column=uuid_fk_column("form.id"))
    data: Dict[str, Any] = Field(default_factory=dict, sa_column=json_column(dict))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    form: Form = Relationship(back_populates="submissions")


class View(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, sa_column=uuid_pk_column())
    project_id: UUID = Field(sa_column=uuid_fk_column("project.id"))
    title: str
    description: Optional[str] = None
    config: Dict[str, Any] = Field(default_factory=dict, sa_column=json_column(dict))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    project: Project = Relationship(back_populates="views")
