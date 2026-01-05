"""Add GIN index on submission.data for fast JSONB queries

Revision ID: 0004_gin_submission_data
Revises: 0003_change_json_to_jsonb
Create Date: 2024-12-02

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0004_gin_submission_data"
down_revision: Union[str, None] = "0003_change_json_to_jsonb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "CREATE INDEX ix_submission_data_gin ON submission USING GIN (data)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX ix_submission_data_gin")
