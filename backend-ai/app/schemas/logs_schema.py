from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from app.models.security_log import LogStatusEnum

class SecurityLogResponse(BaseModel):
    id: int
    api_key_id: int
    timestamp: datetime
    status: LogStatusEnum
    threat_type: Optional[str] = None
    threat_score: Optional[float] = None
    tokens_used: int
    latency_ms: int
    raw_payload: Optional[Any] = None

    class Config:
        from_attributes = True
