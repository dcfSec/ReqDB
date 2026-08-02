import base64
import logging
import secrets

import redis.asyncio as redis
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from itsdangerous import BadSignature, TimestampSigner

from api.config import AppConfig

logger: logging.Logger = logging.getLogger(__name__)


class EncryptedRedisCache:
    """
    EncryptedRedisCache is an async helper for Redis to add encryption to sensitive data.
    """

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
    key: bytes

    def __init__(self) -> None:
        self._generateAESKey()
        pass

    def _generateAESKey(self) -> None:
        """
        Derive a 32-byte AES key from the SESSION_SECRET_KEY using HKDF.
        """
        secret: bytes = AppConfig.SESSION_SECRET_KEY.encode()

        hkdf: HKDF = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"ReqDBEncryptedRedis",
            info=b"ReqDB Redis AES key",
        )
        self.key = hkdf.derive(secret)

    async def set(self, key: str, value: str) -> str:
        """
        Sets a key with content of value in the Redis store.
        The value will be encrypted with AESGCM

        :param str key: Redis key for the entry
        :param str value: A string as value to store
        :return str: Returns the signed key
        """
        nonce: bytes = secrets.token_bytes(12)

        await self.store.set(
            key,
            base64.b64encode(
                nonce + AESGCM(self.key).encrypt(nonce, value.encode(), b"")
            ).decode(),
            self.maxAge,
        )
        return self.signer.sign(key).decode()

    async def get(
        self, signedKey: str, signed: bool = True
    ) -> tuple[str, str] | tuple[None, None]:
        """
        Gets the content of a signed key from the Redis store

        :param str signedKey: A signed key to use for retrieving the content
        :param bool signed: True if the key is signed, defaults to True
        :return tuple[str, str] | tuple[None, None]: Returns a tuple with the key and the retrieved value, if an error occurred returns (None, None)
        """
        try:
            if signed:
                key: str = self.signer.unsign(signedKey, max_age=self.maxAge).decode()
            else:
                key = signedKey
            if await self.store.exists(key):
                try:
                    storedEncryptedValue: bytes = base64.b64decode(
                        await self.store.get(key)
                    )
                    decryptedValue: str = (
                        AESGCM(self.key)
                        .decrypt(
                            storedEncryptedValue[:12],
                            storedEncryptedValue[12:],
                            b"",
                        )
                        .decode()
                    )
                    return key, decryptedValue
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
        """
        Deletes a key from the Redis store

        :param str key: Key to delete
        """
        if await self.store.exists(key):
            await self.store.delete(key)
