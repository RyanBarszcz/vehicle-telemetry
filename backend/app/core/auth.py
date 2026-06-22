import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt

from app.core.config import settings

security = HTTPBearer()

_jwks_cache = None


def get_jwks():
    global _jwks_cache

    if _jwks_cache is None:
        response = requests.get(settings.CLERK_JWKS_URL)
        response.raise_for_status()
        _jwks_cache = response.json()

    return _jwks_cache


def get_current_clerk_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")

        jwks = get_jwks()
        key = next(
            (key for key in jwks["keys"] if key["kid"] == kid),
            None,
        )

        if key is None:
            raise HTTPException(status_code=401, detail="Invalid token key")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={"verify_aud": False},
        )

        return {
            "clerk_id": payload["sub"],
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")