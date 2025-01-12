from api.appDefinition import app, db
from flask_migrate import Migrate
from api.helper import checkAndUpdateConfigDB
from api.models import (
    ExtraEntry,
    ExtraType,
    Requirement,
    Tag,
    Topic,
    Catalogue,
    Comment,
    Audit,
    RequirementTag,
    CatalogueTopic,
    Base,
    User,
    Configuration
)
import api.audit

migrate = Migrate(app, db)

with app.app_context():
    db.create_all()
    checkAndUpdateConfigDB()