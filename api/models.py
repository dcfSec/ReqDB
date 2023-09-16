from api import db


class Base(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)


class RequirementTag(Base):
    __tablename__ = 'RequirementTag'
    requirementId = db.Column(db.Integer, db.ForeignKey('requirement.id'))
    tagId = db.Column(db.Integer, db.ForeignKey('tag.id'))


class CatalogueTopic(Base):
    __tablename__ = 'CatalogueTopic'
    catalogueId = db.Column(db.Integer, db.ForeignKey('catalogue.id'))
    topicId = db.Column(db.Integer, db.ForeignKey('topic.id'))


class Requirement(Base):
    key = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    parentId = db.Column(
        db.Integer, db.ForeignKey('topic.id'), nullable=False)

    extras = db.relationship(
        'ExtraEntry', backref='requirement', lazy="joined")

    tags = db.relationship(
        'Tag',
        secondary='RequirementTag',
        back_populates='requirement'
    )

    def __repr__(self):
        return f'<Requirement "{self.title}">'


class Tag(Base):
    name = db.Column(db.String(50), unique=True, nullable=False)
    requirement = db.relationship(
        'Requirement',
        secondary='RequirementTag'
    )

    def __repr__(self):
        return f'<Tag "{self.name}">'


class Topic(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    parentId = db.Column(db.Integer, db.ForeignKey('topic.id'), nullable=True)
    parent = db.relationship(
        'Topic', remote_side=[id], backref='children', lazy="joined")
    requirements = db.relationship(
        'Requirement', backref='parent', lazy="joined")

    catalogues = db.relationship(
        'Catalogue',
        secondary='CatalogueTopic'
    )

    def __repr__(self):
        return f'<Topic "{self.title}">'


class ExtraType(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    children = db.relationship('ExtraEntry', backref='extraType')
    extraType = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<ExtraType "{self.title}">'


class ExtraEntry(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.Text)
    extraTypeId = db.Column(
        db.Integer, db.ForeignKey('extra_type.id'), nullable=False)
    requirementId = db.Column(
        db.Integer, db.ForeignKey('requirement.id'), nullable=False)

    def __repr__(self):
        return f'<ExtraEntry "{self.content[:20]}">'


class Catalogue(Base):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    maxDepth = db.Column(db.Integer, nullable=False)

    topics = db.relationship(
        'Topic',
        secondary='CatalogueTopic',
        back_populates='catalogues'
    )

    def __repr__(self):
        return f'<Catalogue "{self.title}">'
