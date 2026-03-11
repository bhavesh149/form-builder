"""add respondent info fields

Revision ID: a1b2c3d4e5f6
Revises: 3eb3f4580437
Create Date: 2026-03-10 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '3eb3f4580437'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('forms', sa.Column('collect_respondent_info', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('form_submissions', sa.Column('respondent_name', sa.String(255), nullable=True))
    op.add_column('form_submissions', sa.Column('respondent_email', sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column('form_submissions', 'respondent_email')
    op.drop_column('form_submissions', 'respondent_name')
    op.drop_column('forms', 'collect_respondent_info')
