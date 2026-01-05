from logging.config import fileConfig
import os
import sys
from pathlib import Path
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata

# ensure repo root is on sys.path so `backend` package can be imported
here = Path(__file__).resolve().parent
repo_root = here.parent.parent
sys.path.insert(0, str(repo_root))

# Load environment variables from backend/.env so Alembic picks up DATABASE_URL
env_path = repo_root / 'backend' / '.env'
if env_path.exists():
    load_dotenv(env_path)

from sqlmodel import SQLModel
from backend import database
from backend import models  # noqa: F401  # Import models to register them with SQLModel.metadata

target_metadata = SQLModel.metadata

# Provide sqlalchemy.url if not present in alembic.ini
def get_url() -> str:
    # prefer environment variable
    url = os.getenv('DATABASE_URL')
    if url:
        return url
    # fallback to backend.database sqlite url
    try:
        return database.sqlite_url
    except Exception:
        opt = config.get_main_option("sqlalchemy.url")
        return opt if opt is not None else ""

def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
