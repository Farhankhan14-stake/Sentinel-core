from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/billing", tags=["billing"])

@router.get("")
def get_billing_info(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "tier": current_user.tier,
        "monthly_limit": current_user.monthly_limit,
        "status": "active"
    }
