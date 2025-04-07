"""Drop foreign key from rooms.current_song_id

Revision ID: 019cb8354622
Revises: c8dc1377b836
Create Date: 2025-04-03 13:13:08.774163

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '019cb8354622'
down_revision: Union[str, None] = 'c8dc1377b836'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint('rooms_current_song_id_fkey', 'rooms', type_='foreignkey')
    


def downgrade() -> None:
    op.create_foreign_key(
        'rooms_current_song_id_fkey',
        'rooms',
        'songs',
        ['current_song_id'],
        ['id']
    )
