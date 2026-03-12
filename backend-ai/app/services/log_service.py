from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.api_key import APIKey
from app.models.security_log import SecurityLog


def get_user_logs(db: Session, user_id: int, limit: int = 100):
    user_keys = db.query(APIKey.id).filter(APIKey.user_id == user_id).all()
    key_ids = [row[0] for row in user_keys]
    if not key_ids:
        return []
    return (
        db.query(SecurityLog)
        .filter(SecurityLog.api_key_id.in_(key_ids))
        .order_by(SecurityLog.timestamp.desc())
        .limit(limit)
        .all()
    )


def get_log_by_id(db: Session, user_id: int, log_id: int):
    user_keys = db.query(APIKey.id).filter(APIKey.user_id == user_id).all()
    key_ids = [row[0] for row in user_keys]
    log = db.query(SecurityLog).filter(SecurityLog.id == log_id, SecurityLog.api_key_id.in_(key_ids)).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    return log


def delete_log_by_id(db: Session, user_id: int, log_id: int):
    log = get_log_by_id(db, user_id, log_id)
    db.delete(log)
    db.commit()
    return log
