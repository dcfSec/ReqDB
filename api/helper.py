import smtplib
from email.message import EmailMessage
import time

from fastapi import Request, Response
from sqlmodel import Session

from api.config import AppConfig, dynamicConfig
from api.error import ConflictError, NotFound
from api.models import engine
from api.models.db import Configuration, Topic


def checkAndUpdateConfigDB():
    """
    Checks the configuration table if all dynamic configuration keys are available with the correct type and description
    """

    with Session(engine) as session:
        for key, config in dynamicConfig.items():
            item = session.get(Configuration, key)
            if not item:
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
                if config["description"] != item.description:
                    item.description = config["description"]
                if config["type"] != item.description:
                    item.type = config["type"]
                if config["category"] != item.category:
                    item.category = config["category"]
                session.add(item)
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
                    "Can't add child to parent Topic",
                    "Topic has already requirements.",
                ]
            )
        if not forRequirements and len(topic.children) > 0:
            raise ConflictError(
                detail=[
                    "Can't add requirement to parent Topic",
                    "Topic has already children.",
                ]
            )

class RequestTimer:
    def __init__(self, response: Response, target: str):
        self.response = response
        self.target = target
        self.startTime = None
    
    def __enter__(self):
        self.startTime = time.perf_counter_ns()

    def __exit__(self, exc_type, exc_value, traceback):
        processTime = time.perf_counter_ns() - self.startTime
        if "server-timing" not in self.response.headers:
            self.response.headers["server-timing"] = f"{self.target};dur={str(processTime/1000000)}"
        else:
            self.response.headers["server-timing"] += f",{self.target};dur={str(processTime/1000000)}"
