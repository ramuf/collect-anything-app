"""empty migration to satisfy alembic filename

Revision ID: b5afd7a27220
Revises: 0002_add_views
Create Date: 2025-12-02
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b5afd7a27220'
down_revision = '0002_add_views'
branch_labels = None
depends_on = None


def upgrade():
    # intentionally empty: this file was a duplicate filename without metadata
    pass


def downgrade():
    pass
