import re

from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from app.models.user import TierEnum

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value: str) -> str:
        if len(value) < 12:
            raise ValueError("Password must be at least 12 characters long")
        checks = [
            re.search(r"[A-Z]", value),
            re.search(r"[a-z]", value),
            re.search(r"\d", value),
            re.search(r"[^A-Za-z0-9]", value),
        ]
        if not all(checks):
            raise ValueError("Password must include uppercase, lowercase, number, and special character")
        return value

class UserResponse(UserBase):
    id: int
    tier: TierEnum
    monthly_limit: int
    created_at: datetime

    class Config:
        from_attributes = True
