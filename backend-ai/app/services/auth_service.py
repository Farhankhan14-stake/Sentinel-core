from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user_schema import UserCreate
from app.utils.hashing import get_password_hash, verify_password
from app.utils.token_generator import create_password_reset_token

def create_user(db: Session, user: UserCreate):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def issue_password_reset_token(db: Session, email: str) -> str | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    return create_password_reset_token({"sub": user.email})


def update_password_for_user(db: Session, user: User, new_password: str) -> User:
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user
