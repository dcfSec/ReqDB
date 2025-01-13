from flask import abort
from api.appDefinition import db
from api.models import Configuration
from api.config import dynamicConfig


def checkAccess(jwt, neededRoles):
    if "roles" not in jwt or (
        len(neededRoles) > 0 and not (set(jwt["roles"]) & set(neededRoles))
    ):
        abort(
            401, {"status": 400, "error": "IntegrityError", "message": "Missing role"}
        )


def checkAndUpdateConfigDB():
    data = Configuration.query.all()

    dataKeys = [d.key for d in data]

    for key, config in dynamicConfig.items():
        if key not in dataKeys:
            db.session.add(
                Configuration(
                    key=key,
                    value=config["value"],
                    type=config["type"],
                    description=config["description"],
                    category=config["category"],
                )
            )
        else:
            if config["description"] != data[dataKeys.index(key)].description:
                data[dataKeys.index(key)].description = config["description"]
            if config["type"] != data[dataKeys.index(key)].description:
                data[dataKeys.index(key)].type = config["type"]
            if config["category"] != data[dataKeys.index(key)].category:
                data[dataKeys.index(key)].category = config["category"]
    db.session.commit()
