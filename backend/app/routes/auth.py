import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_clerk_user_id
from app.core.config import settings
from app.database import get_db
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


def get_clerk_user(user_id: str) -> dict:
    response = requests.get(
        f"https://api.clerk.com/v1/users/{user_id}",
        headers={
            "Authorization":
                f"Bearer {settings.CLERK_SECRET_KEY}",
        },
        timeout=10,
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=401,
            detail="Failed to fetch Clerk user",
        )

    return response.json()


@router.post("/sync")
def sync_account(
    db: Session = Depends(get_db),
    clerk_user_id: str = Depends(
        get_clerk_user_id
    ),
):
    clerk_user = get_clerk_user(
        clerk_user_id
    )

    email_addresses = clerk_user.get(
        "email_addresses",
        []
    )

    if not email_addresses:
        raise HTTPException(
            status_code=400,
            detail="Clerk user has no email address",
        )

    email = email_addresses[0][
        "email_address"
    ]

    first_name = (
        clerk_user.get("first_name") or ""
    )

    last_name = (
        clerk_user.get("last_name") or ""
    )

    user = (
        db.query(User)
        .filter(
            User.clerk_id == clerk_user_id
        )
        .first()
    )

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

    return {
        "user": user,
    }