import requests
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()


def get_clerk_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    token = credentials.credentials

    response = requests.get(
        "https://api.clerk.com/v1/sessions/verify",
        headers={
            "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        params={
            "token": token,
        },
    )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Unauthorized")

    data = response.json()
    user_id = data.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return user_id


def get_clerk_user(user_id: str):
    response = requests.get(
        f"https://api.clerk.com/v1/users/{user_id}",
        headers={
            "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
        },
    )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Failed to fetch Clerk user")

    return response.json()


@router.post("/sync")
def sync_account(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(get_clerk_user_id),
):
    clerk_user = get_clerk_user(clerk_user_id)

    email = clerk_user["email_addresses"][0]["email_address"]
    first_name = clerk_user.get("first_name") or ""
    last_name = clerk_user.get("last_name") or ""

    user = db.query(User).filter(User.clerk_id == clerk_user_id).first()

    if user:
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
    else:
        user = User(
            clerk_id=clerk_user_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        db.add(user)

    db.commit()
    db.refresh(user)

    return {"user": user}