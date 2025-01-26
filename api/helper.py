import smtplib
from email.message import EmailMessage

from sqlmodel import Session, select

from api.config import AppConfig, dynamicConfig
from api.error import ConflictError, NotFound
from api.models import engine
from api.models.db import Configuration, Topic


def checkAndUpdateConfigDB():
    """
    Checks the configuration table if all dynamic configuration keys are available with the correct type and description
    """

    
    with Session(engine) as session:
        data = session.exec(select(Configuration)).all()

        dataKeys = [d.key for d in data]
        
        for key, config in dynamicConfig.items():
            if key not in dataKeys:
                session.add(
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
                session.add(data[dataKeys.index(key)])
        session.commit()


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
    msg["From"] = AppConfig.EMAIL_FROM
    msg["To"] = recipient

    with smtplib.SMTP("localhost") as s:
        s.ehlo()
        s.starttls()
        s.ehlo()
        s.login(AppConfig.EMAIL_USER, AppConfig.EMAIL_PASSWORD)
        s.sendmail(AppConfig.EMAIL_FROM, recipient, msg.as_string())



def checkParentTopicChildren(topicID: int, session, forRequirements: bool = False):
    if topicID:
        topic = session.get(Topic, topicID)
        if not topic:
            raise NotFound(detail="Parent not found")
        if forRequirements and len(topic.requirements) > 0:
            raise ConflictError(
                detail=[
                    "Can't add child to parent Topic", "Topic has already requirements.",
                ]
            )
        if not forRequirements and len(topic.children) > 0:
            raise ConflictError(
                detail=[
                    "Can't add requirement to parent Topic", "Topic has already children.",
                ]
            )

