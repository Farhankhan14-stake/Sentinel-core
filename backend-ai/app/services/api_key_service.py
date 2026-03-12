import re

from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.api_key import APIKey, KeyStatusEnum
from app.schemas.api_key_schema import APIKeyCreate
from app.utils.api_key_generator import generate_api_key
from app.utils.hashing import get_password_hash, verify_password
from app.models.user import User
from app.core.config import settings
from app.services.audit_service import log_api_key_creation

API_KEY_PATTERN = re.compile(r"^sk_live_[A-Za-z0-9]{32}$")

def create_api_key(db: Session, user_id: int, key_in: APIKeyCreate):
    raw_key = generate_api_key()
    key_hash = get_password_hash(raw_key)
    
    db_key = APIKey(
        user_id=user_id,
        key_hash=key_hash,
        name=key_in.name
    )
    db.add(db_key)
    db.commit()
    db.refresh(db_key)
    log_api_key_creation(user_id, key_in.name)
    
    return db_key, raw_key

def get_user_api_keys(db: Session, user_id: int):
    return db.query(APIKey).filter(APIKey.user_id == user_id).all()

def revoke_api_key(db: Session, user_id: int, key_id: int):
    db_key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.user_id == user_id).first()
    if not db_key:
        raise HTTPException(status_code=404, detail="API Key not found")
    
    db_key.status = KeyStatusEnum.REVOKED
    db.commit()
    db.refresh(db_key)
    return db_key


def find_api_key_by_raw_key(db: Session, raw_key: str):
    if not API_KEY_PATTERN.match(raw_key):
        return None
    active_keys = db.query(APIKey).filter(APIKey.status == KeyStatusEnum.ACTIVE).all()
    for db_key in active_keys:
        if verify_password(raw_key, db_key.key_hash):
            return db_key
    return None


def get_or_create_demo_api_key(db: Session, user: User):
    demo_key = find_api_key_by_raw_key(db, settings.TEST_API_KEY)
    if demo_key:
        return demo_key

    key_in = APIKeyCreate(name="Frontend Demo Key")
    db_key, raw_key = create_api_key(db, user.id, key_in)
    if raw_key != settings.TEST_API_KEY:
        db_key.key_hash = get_password_hash(settings.TEST_API_KEY)
        db.commit()
        db.refresh(db_key)
    return db_key
