import base64
import logging
import secrets

import redis.asyncio as redis
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from itsdangerous import BadSignature, TimestampSigner

from api.config import AppConfig

logger: logging.Logger = logging.getLogger(__name__)


class EncryptedRedisCache:
    store = redis.Redis(
        host=AppConfig.REDIS_HOST,
        port=AppConfig.REDIS_PORT,
        password=AppConfig.REDIS_PASSWORD,
        db=AppConfig.REDIS_DB,
        ssl=AppConfig.REDIS_TLS,
        decode_responses=True,
    )
    signer = TimestampSigner(AppConfig.SESSION_SECRET_KEY, b"EncryptedRedis")
    maxAge: int = 14 * 24 * 60 * 60
    key: bytes = secrets.token_bytes(32)

    def __init__(self) -> None:
        pass

    async def set(self, key: str, value: str) -> str:
        nonce: bytes = secrets.token_bytes(12)

        await self.store.set(
            key,
            base64.b64encode(
                nonce + AESGCM(self.key).encrypt(nonce, value.encode(), b"")
            ).decode(),
            self.maxAge,
        )
        return self.signer.sign(key).decode()

    async def get(self, signedKey, signed=True) -> tuple[str, str] | tuple[None, None]:
        try:
            if signed:
                key: str = self.signer.unsign(signedKey, max_age=self.maxAge).decode()
            else:
                key = signedKey
            if await self.store.exists(key):
                try:
                    storedEncryptedSession: bytes = base64.b64decode(
                        await self.store.get(key)
                    )
                    decryptedSession: str = (
                        AESGCM(self.key)
                        .decrypt(
                            storedEncryptedSession[:12],
                            storedEncryptedSession[12:],
                            b"",
                        )
                        .decode()
                    )
                    return key, decryptedSession
                except InvalidTag:
                    logger.error(f"Can't decrypt stored values with ID: {key}")
                    return None, None
            else:
                logger.error(f"No session with the given key found")
                return None, None
        except BadSignature:
            logger.error(f"Bad signature for the given session")
            return None, None

    async def delete(self, key: str) -> None:
        if await self.store.exists(key):
            await self.store.delete(key)
