from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class TierEnum(str, enum.Enum):
    FREE = "FREE"
    PRO = "PRO"
    BUSINESS = "BUSINESS"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    tier = Column(Enum(TierEnum), default=TierEnum.FREE)
    monthly_limit = Column(Integer, default=1000)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
