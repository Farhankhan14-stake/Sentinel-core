from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.hashing import get_password_hash, verify_password


def get_user_profile(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_user_profile(db: Session, user: User, updates: dict) -> User:
    for field, value in updates.items():
        if hasattr(user, field) and value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def change_user_password(db: Session, user: User, current_password: str, new_password: str) -> User:
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user


def delete_user_account(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
