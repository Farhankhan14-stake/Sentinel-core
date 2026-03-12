from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.middleware.auth_middleware import decode_token, get_current_user
from app.models.user import User
from app.schemas.auth_schema import ForgotPasswordRequest, RefreshTokenRequest, ResetPasswordRequest, Token
from app.schemas.user_schema import UserCreate, UserResponse
from app.services.audit_service import log_login_attempt
from app.services.auth_service import authenticate_user, create_user, issue_password_reset_token, update_password_for_user
from app.utils.token_generator import create_access_token, create_refresh_token
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db=db, user=user)

@router.post("/login", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        log_login_attempt(form_data.username, False, request.client.host if request.client else None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    log_login_attempt(user.email, True, request.client.host if request.client else None)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest):
    token_data = decode_token(payload.refresh_token, expected_type="refresh")
    access_token = create_access_token(data={"sub": token_data.email})
    refresh_token_value = create_refresh_token(data={"sub": token_data.email})
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token_value}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    issue_password_reset_token(db, payload.email)
    return {"message": "If the account exists, a password reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    token_data = decode_token(payload.token, expected_type="password_reset")
    user = db.query(User).filter(User.email == token_data.email).first()
    if user:
        validated = UserCreate(email=user.email, password=payload.new_password)
        update_password_for_user(db, user, validated.password)
    return {"message": "Password reset completed successfully."}


@router.get("/me", response_model=UserResponse)
def read_auth_me(current_user: User = Depends(get_current_user)):
    return current_user
