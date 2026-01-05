from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
import os

# Prefer DATABASE_URL environment variable (e.g. postgresql+psycopg://user:pass@host/db)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required. Please set it to a PostgreSQL connection string.")

DATABASE_URL = DATABASE_URL.strip('\'"')

# keep sqlite constants available for alembic/env.py fallback (but not used here)
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(DATABASE_URL)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
