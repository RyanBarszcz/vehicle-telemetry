from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    clerk_id: str
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True