from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class LogStatusEnum(str, enum.Enum):
    CLEAN = "CLEAN"
    BLOCKED = "BLOCKED"
    REDACTED = "REDACTED"

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True)
    api_key_id = Column(Integer, ForeignKey("api_keys.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(LogStatusEnum), nullable=False)
    threat_type = Column(String, nullable=True)
    threat_score = Column(Float, nullable=True)
    tokens_used = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    raw_payload = Column(JSON, nullable=True)
