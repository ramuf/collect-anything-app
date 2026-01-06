"""Add description column to form

Revision ID: 0005_add_form_description
Revises: 0004_gin_submission_data
Create Date: 2026-01-06

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0005_add_form_description"
down_revision = "0004_gin_submission_data"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('form', sa.Column('description', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('form', 'description')
