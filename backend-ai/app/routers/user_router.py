from fastapi import APIRouter, Depends
from app.schemas.user_schema import UserResponse
from app.models.user import User
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
