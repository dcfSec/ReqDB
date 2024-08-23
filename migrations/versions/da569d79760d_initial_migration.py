"""Initial migration

Revision ID: da569d79760d
Revises: 
Create Date: 2024-08-23 17:18:49.956871

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'da569d79760d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('catalogue', schema=None) as batch_op:
        batch_op.drop_column('maxDepth')

    with op.batch_alter_table('comment', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_comment_requirementId'), ['requirementId'], unique=False)

    with op.batch_alter_table('extra_entry', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_extra_entry_extraTypeId'), ['extraTypeId'], unique=False)
        batch_op.create_index(batch_op.f('ix_extra_entry_requirementId'), ['requirementId'], unique=False)
        batch_op.create_foreign_key('fk_extra_type', 'extra_type', ['extraTypeId'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key('fk_requirement', 'requirement', ['requirementId'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('requirement', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_requirement_parentId'), ['parentId'], unique=False)
        batch_op.create_foreign_key('fk_topic', 'topic', ['parentId'], ['id'], ondelete='CASCADE')

    with op.batch_alter_table('topic', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_topic_parentId'), ['parentId'], unique=False)
        batch_op.create_foreign_key('fk_topic', 'topic', ['parentId'], ['id'], ondelete='CASCADE')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('topic', schema=None) as batch_op:
        batch_op.drop_constraint('fk_topic', type_='foreignkey')
        batch_op.create_foreign_key(None, 'topic', ['parentId'], ['id'])
        batch_op.drop_index(batch_op.f('ix_topic_parentId'))

    with op.batch_alter_table('requirement', schema=None) as batch_op:
        batch_op.drop_constraint('fk_topic', type_='foreignkey')
        batch_op.create_foreign_key(None, 'topic', ['parentId'], ['id'])
        batch_op.drop_index(batch_op.f('ix_requirement_parentId'))

    with op.batch_alter_table('extra_entry', schema=None) as batch_op:
        batch_op.drop_constraint('fk_requirement', type_='foreignkey')
        batch_op.drop_constraint('fk_extra_type', type_='foreignkey')
        batch_op.create_foreign_key(None, 'requirement', ['requirementId'], ['id'])
        batch_op.create_foreign_key(None, 'extra_type', ['extraTypeId'], ['id'])
        batch_op.drop_index(batch_op.f('ix_extra_entry_requirementId'))
        batch_op.drop_index(batch_op.f('ix_extra_entry_extraTypeId'))

    with op.batch_alter_table('comment', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_comment_requirementId'))

    with op.batch_alter_table('catalogue', schema=None) as batch_op:
        batch_op.add_column(sa.Column('maxDepth', sa.INTEGER(), nullable=False))

    with op.batch_alter_table('CatalogueTopic', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_CatalogueTopic_topicId'))
        batch_op.drop_index(batch_op.f('ix_CatalogueTopic_catalogueId'))
    # ### end Alembic commands ###