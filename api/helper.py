import smtplib
import time
from email.message import EmailMessage
from urllib.parse import urlparse

from fastapi import Response
from sqlmodel import Session, select

from api.config import AppConfig
from api.error import ConflictError, NotFound
from api.models import engine
from api.models.db import Comment, Configuration, Topic, User


def checkAndUpdateConfigDB():
    """
    Checks the configuration table if all dynamic configuration keys are available with the correct type and description.
    Also checks if there are vacant configuration keys in the DB and deletes them if needed
    """

    with Session(engine) as session:
        for key, config in AppConfig.getDynamicConfig().items():
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
        dbConfig = session.exec(select(Configuration)).all()
        for dbConfigItem in dbConfig:
            if dbConfigItem.key not in AppConfig.getDynamicConfig().keys():
                session.delete(dbConfigItem)
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

    with smtplib.SMTP(
        AppConfig.EMAIL_HOST,
        AppConfig.EMAIL_PORT,
        local_hostname=urlparse(AppConfig.BASE_URL).netloc,
    ) as s:
        if AppConfig.EMAIL_TLS is True:
            s.starttls()
        if AppConfig.EMAIL_USER != "" and AppConfig.EMAIL_PASSWORD != "":
            s.login(AppConfig.EMAIL_USER, AppConfig.EMAIL_PASSWORD)
        s.sendmail(AppConfig.EMAIL_FROM, recipient, msg.as_string())


def checkParentTopicChildren(
    topicID: int, session: Session, forRequirements: bool = False
):
    """
    Checks if the topic has topic or requirements of children

    :param int topicID: The topic ID to check
    :param Session session: The DB session
    :param bool forRequirements: True if you want to check for adding a requirement, defaults to False
    :raises NotFound: Raises if the topic with the ID is not found
    :raises ConflictError: Raises, if the topic already has requirements when searching for requirements
    :raises ConflictError: Raises, if the topic has already children when searching for children
    """
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
    """
    Sends an email notification to users when they activated to receive those for new comments.
    This is only activated when the AppConfig is set up correctly

    :param Session session: DB Session
    :param int commentID: Id for the new comment
    """

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
            if (
                AppConfig.EMAIL_SEND_SELF is True
                or chainRecipient != comment.author.email
            ):
                sendNotificationMail(
                    chainRecipient,
                    f"A user added a comment to a chain you are participating in (Requirement: {comment.requirement.key})",
                    f"{comment.author.email} added following comment to {comment.requirement.key} in reply to a comment from you:\n\n-------\n{comment.comment}\n-------\n\nGo to the requirement: {AppConfig.BASE_URL}/Browse/Requirement/{comment.requirement.id}",
                )

        for recipient in emailRecipientsFromRequirement:
            if (
                recipient.email not in emailRecipientsFromChain
                and recipient.active is True
                and (
                    AppConfig.EMAIL_SEND_SELF is True
                    or recipient.id != comment.authorId
                )
            ):
                sendNotificationMail(
                    recipient.email,
                    f"A user added a new comment to a requirement ({comment.requirement.key})",
                    f"{comment.author.email} added following comment to {comment.requirement.key}:\n\n-------\n{comment.comment}\n-------\n\nGo to the requirement: {AppConfig.BASE_URL}/Browse/Requirement/{comment.requirement.id}",
                )


def checkParentCommentAuthor(comment: Comment) -> set:
    """
    Returns a set of authors for a comment chain with activated notification on comment

    :param Comment comment: The comment to search
    :return set: A set of notification recipients
    """
    r = []
    if comment is not None:
        if comment.parentId is not None:
            r += checkParentCommentAuthor(comment.parent)
        if (
            comment.author.notificationMailOnCommentChain is True
            and comment.author.active is True
        ):
            r.append(comment.author.email)
    return set(r)
