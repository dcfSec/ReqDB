import smtplib
from email.message import EmailMessage

from flask import abort

from api.appDefinition import db
from api.config import Config, dynamicConfig
from api.models import Configuration


def checkAccess(jwt: dict, neededRoles: list[str]):
    """
    Checks the access for a request. Checks if the jwt contains the needed roles.
    Aborts if the required roles are not met

    :param dict jwt: Dict with the JWT properties
    :param list neededRoles: List with the needed roles
    """

    if "roles" not in jwt or (
        len(neededRoles) > 0 and not (set(jwt["roles"]) & set(neededRoles))
    ):
        abort(
            401,
            {
                "status": 400,
                "error": "AuthorizationError",
                "message": "Missing a needed role for this request.",
            },
        )


def checkAndUpdateConfigDB():
    """
    Checks the configuration table if all dynamic configuration keys are available with the correct type and description
    """
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


def sendNotificationMail(recipient: str, subject: str, content: str):
    """
    Sends an email notification to a specific recipient

    :param str recipient: The recipient mail for the notification
    :param str subject: The subject of the mail
    :param str content: The content of the mail
    """

    msg = EmailMessage()
    msg.set_content(content)

    msg["Subject"] = subject
    msg["From"] = Config.EMAIL_FROM
    msg["To"] = recipient

    with smtplib.SMTP("localhost") as s:
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(Config.EMAIL_USER, Config.EMAIL_PASSWORD)
        s.sendmail(Config.EMAIL_FROM, recipient, msg.as_string())
