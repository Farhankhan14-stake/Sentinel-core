from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class KeyStatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    key_hash = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, default="Default Key")
    usage_count = Column(Integer, default=0)
    status = Column(Enum(KeyStatusEnum), default=KeyStatusEnum.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
