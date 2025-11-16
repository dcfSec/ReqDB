from os import getenv


class ConnectorConfig:
    class Atlassian:
        OAUTH_CLIENT_ID: str = getenv("ATLASSIAN_OAUTH_CLIENT_ID", "")
        OAUTH_CLIENT_SECRET: str = getenv("ATLASSIAN_OAUTH_CLIENT_SECRET", "")
        OAUTH_SCOPE: str = getenv(
            "ATLASSIAN_OAUTH_SCOPE",
            "offline_access read:jira-user read:jira-work write:jira-work",
        )

        TENANT: str = getenv("ATLASSIAN_TENANT", "")
