from pydantic import BaseModel, Field, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str | None = None

class TokenData(BaseModel):
    email: str | None = None
    token_type: str | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(min_length=32)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=32)
    new_password: str = Field(min_length=12, max_length=128)
