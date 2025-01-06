from api.appDefinition import app, db
from flask_migrate import Migrate
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
)
import api.audit

migrate = Migrate(app, db)
