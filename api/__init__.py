from flask_migrate import Migrate

import api.audit
from api.appDefinition import app, db
from api.helper import checkAndUpdateConfigDB
from api.models import (
    Audit,
    Base,
    Catalogue,
    CatalogueTopic,
    Comment,
    Configuration,
    ExtraEntry,
    ExtraType,
    Requirement,
    RequirementTag,
    Tag,
    Topic,
    User,
)

migrate = Migrate(app, db)

with app.app_context():
    db.create_all()
    checkAndUpdateConfigDB()
