from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.security_log import SecurityLog
from app.models.api_key import APIKey
from app.middleware.auth_middleware import get_current_user
from app.schemas.logs_schema import SecurityLogResponse

router = APIRouter(prefix="/api/logs", tags=["logs"])

@router.get("", response_model=List[SecurityLogResponse])
def get_logs(limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get logs for all API keys belonging to the user
    user_keys = db.query(APIKey.id).filter(APIKey.user_id == current_user.id).all()
    key_ids = [k[0] for k in user_keys]
    
    logs = db.query(SecurityLog).filter(SecurityLog.api_key_id.in_(key_ids)).order_by(SecurityLog.timestamp.desc()).limit(limit).all()
    return logs
