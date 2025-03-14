import smtplib
from email.message import EmailMessage
import time

from fastapi import Request, Response
from sqlmodel import Session, select

from api.config import AppConfig, dynamicConfig
from api.error import ConflictError, NotFound
from api.models import engine
from api.models.db import Comment, Configuration, Topic, User
from urllib.parse import urlparse

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
    msg.set_content(
        f"{content}\n\nThis message was auto generated from your ReqDB Server at {AppConfig.BASE_URL}. You can disable this notification in your preferences"
    )

    msg["Subject"] = f"[ReqDB] {subject}"
    msg["From"] = AppConfig.EMAIL_FROM
    msg["To"] = recipient

    with smtplib.SMTP(AppConfig.EMAIL_HOST, AppConfig.EMAIL_PORT, local_hostname=urlparse(AppConfig.BASE_URL).netloc) as s:
        if AppConfig.EMAIL_TLS is True:
            s.starttls()
        if AppConfig.EMAIL_USER != "" and AppConfig.EMAIL_PASSWORD != "":
            s.login(AppConfig.EMAIL_USER, AppConfig.EMAIL_PASSWORD)
        s.sendmail(AppConfig.EMAIL_FROM, recipient, msg.as_string())


def checkParentTopicChildren(
    topicID: int, session: Session, forRequirements: bool = False
):
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
            self.response.headers["server-timing"] = (
                f"{self.target};dur={str(processTime/1000000)}"
            )
        else:
            self.response.headers[
                "server-timing"
            ] += f",{self.target};dur={str(processTime/1000000)}"


async def sendNotificationMailForNewComment(session: Session, commentID: int):

    if AppConfig.EMAIL_ACTIVE is True:
        comment = session.get(Comment, commentID)
        emailRecipientsFromChain = checkParentCommentAuthor(comment.parent)
        emailRecipientsFromRequirement = (
            session.exec(
                select(User).where(User.notificationMailOnRequirementComment == True)
            )
            .unique()
            .all()
        )

        for chainRecipient in emailRecipientsFromChain:
            if True: # or chainRecipient != comment.author.email:
                print("ok call send", chainRecipient)
                
                sendNotificationMail(
                    chainRecipient,
                    f"A user added a comment to a chain you are participating in (Requirement: {comment.requirement.key})",
                    f"{comment.author.email} added following comment to {comment.requirement.key}:\n\n-------\n{comment.comment}\n-------\n\nGo to the requirement: {AppConfig.BASE_URL}/Browse/Requirement/{comment.requirement.id}",
                )

        for recipient in emailRecipientsFromRequirement:
            if (
                recipient.email not in emailRecipientsFromChain
                and recipient.id != comment.authorId
            ):
                sendNotificationMail(
                    chainRecipient,
                    f"A user added a new comment to a requirement ({comment.requirement.key})",
                    f"{comment.author.email} added following comment to {comment.requirement.key}:\n\n-------\n{comment.comment}\n-------\n\nGo to the requirement: {AppConfig.BASE_URL}/Browse/Requirement/{comment.requirement.id}",
                )


def checkParentCommentAuthor(comment: Comment) -> set:
    r = []
    if comment is not None:
        if comment.parentId is not None:
            r += checkParentCommentAuthor(comment.parent)
        if comment.author.notificationMailOnCommentChain is True:
            r.append(comment.author.email)
    return set(r)
