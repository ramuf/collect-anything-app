"""Change JSON columns to JSONB for better indexing and querying

Revision ID: 0003_change_json_to_jsonb
Revises: b5afd7a27220
Create Date: 2024-12-02

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects.postgresql import JSONB
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003_change_json_to_jsonb"
down_revision: Union[str, None] = "b5afd7a27220"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Change JSON columns to JSONB using ALTER COLUMN TYPE with USING clause
    # Project.settings
    op.execute(
        "ALTER TABLE project ALTER COLUMN settings TYPE JSONB USING settings::jsonb"
    )
    
    # Form.schema_
    op.execute(
        "ALTER TABLE form ALTER COLUMN schema_ TYPE JSONB USING schema_::jsonb"
    )
    
    # Form.settings
    op.execute(
        "ALTER TABLE form ALTER COLUMN settings TYPE JSONB USING settings::jsonb"
    )
    
    # Submission.data
    op.execute(
        "ALTER TABLE submission ALTER COLUMN data TYPE JSONB USING data::jsonb"
    )
    
    # View.config
    op.execute(
        "ALTER TABLE view ALTER COLUMN config TYPE JSONB USING config::jsonb"
    )


def downgrade() -> None:
    # Revert JSONB columns back to JSON
    op.execute(
        "ALTER TABLE project ALTER COLUMN settings TYPE JSON USING settings::json"
    )
    
    op.execute(
        "ALTER TABLE form ALTER COLUMN schema_ TYPE JSON USING schema_::json"
    )
    
    op.execute(
        "ALTER TABLE form ALTER COLUMN settings TYPE JSON USING settings::json"
    )
    
    op.execute(
        "ALTER TABLE submission ALTER COLUMN data TYPE JSON USING data::json"
    )
    
    op.execute(
        "ALTER TABLE view ALTER COLUMN config TYPE JSON USING config::json"
    )
