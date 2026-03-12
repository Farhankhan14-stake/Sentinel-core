from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal, get_db
from app.models.user import User
from app.schemas.auth_schema import TokenData
from app.utils.hashing import get_password_hash
from app.services.api_key_service import find_api_key_by_raw_key
from app.services.audit_service import log_failed_auth

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def _get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.email == settings.DEMO_USER_EMAIL).first()
    if user:
        return user

    user = User(
        email=settings.DEMO_USER_EMAIL,
        hashed_password=get_password_hash("demo-password"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def decode_token(token: str, expected_type: str = "access") -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            audience=settings.JWT_AUDIENCE,
            issuer=settings.JWT_ISSUER,
        )
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != expected_type:
            raise credentials_exception
        return TokenData(email=email, token_type=token_type)
    except JWTError as exc:
        raise credentials_exception from exc


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        if settings.ENABLE_DEMO_MODE:
            return _get_or_create_demo_user(db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = decode_token(token, expected_type="access")
    user = db.query(User).filter(User.email == token_data.email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def attach_security_context(request: Request, call_next):
    request.state.user = None
    request.state.api_key = None

    db = SessionLocal()
    try:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            try:
                token_data = decode_token(token, expected_type="access")
                request.state.user = db.query(User).filter(User.email == token_data.email).first()
            except HTTPException:
                log_failed_auth("invalid_bearer_token", ip_address=request.client.host if request.client else None)

        api_key = request.headers.get("x-api-key")
        if api_key:
            resolved_key = find_api_key_by_raw_key(db, api_key)
            if resolved_key:
                request.state.api_key = resolved_key
            else:
                log_failed_auth("invalid_api_key", ip_address=request.client.host if request.client else None)

        response = await call_next(request)
        return response
    finally:
        db.close()
