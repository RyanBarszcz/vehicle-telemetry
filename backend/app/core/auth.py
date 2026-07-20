from functools import lru_cache
from typing import Any

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from jose import JWTError, jwt

from app.core.config import settings

security = HTTPBearer()


@lru_cache(maxsize=1)
def get_jwks() -> dict[str, Any]:
    response = requests.get(
        settings.CLERK_JWKS_URL,
        timeout=10,
    )
    response.raise_for_status()

    return response.json()


def get_clerk_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> str:
    token = credentials.credentials

    try:
        token_header = jwt.get_unverified_header(token)
        key_id = token_header.get("kid")

        if not key_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        jwks = get_jwks()

        signing_key = next(
            (
                key
                for key in jwks.get("keys", [])
                if key.get("kid") == key_id
            ),
            None,
        )

        if signing_key is None:
            get_jwks.cache_clear()
            jwks = get_jwks()

            signing_key = next(
                (
                    key
                    for key in jwks.get("keys", [])
                    if key.get("kid") == key_id
                ),
                None,
            )

        if signing_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={
                "verify_aud": False,
            },
        )

        clerk_user_id = payload.get("sub")

        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )

        return clerk_user_id

    except HTTPException:
        raise
    except (JWTError, requests.RequestException, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )