from pydantic import BaseModel, Field, HttpUrl, field_validator


class ScanRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=10000)
    image_data: str | None = Field(default=None, max_length=500000)


class URLScanRequest(BaseModel):
    url: HttpUrl


class FileScanMetadata(BaseModel):
    filename: str
    content_type: str
    size: int

    @field_validator("size")
    @classmethod
    def validate_size(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("Uploaded file must not be empty")
        return value


class SecurityReport(BaseModel):
    threat_type: str
    action_taken: str
    detection_reason: str


class ScanResponse(BaseModel):
    status: str
    threat_type: str
    sanitized_content: str | None = None
    analysis: dict | None = None
    security_report: SecurityReport
