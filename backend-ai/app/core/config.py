from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentinel AI Security Gateway"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./sentinel.db" # Default to sqlite for easy testing
    JWT_SECRET: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "sentinelcore"
    JWT_AUDIENCE: str = "sentinelcore-api"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30
    API_KEY_SECRET: str = "change-me"
    LOG_LEVEL: str = "INFO"
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["*"])
    ENABLE_DEMO_MODE: bool = False
    DEMO_USER_EMAIL: str = "admin@sentinel.ai"
    TEST_API_KEY: str = "sk_live_test_key_123"
    GEMINI_API_KEY: str | None = None
    MAX_REQUEST_SIZE_BYTES: int = 1048576
    MAX_UPLOAD_SIZE_BYTES: int = 5242880
    ALLOWED_UPLOAD_TYPES: List[str] = Field(default_factory=lambda: [
        "text/plain",
        "application/json",
        "text/csv",
        "application/pdf",
    ])
    HSTS_ENABLED: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | List[str]) -> List[str]:
        if isinstance(value, list):
            return value
        if not value:
            return ["*"]
        return [origin.strip() for origin in value.split(",") if origin.strip()]

    @field_validator("ALLOWED_UPLOAD_TYPES", mode="before")
    @classmethod
    def parse_upload_types(cls, value: str | List[str]) -> List[str]:
        if isinstance(value, list):
            return value
        if not value:
            return []
        return [item.strip() for item in value.split(",") if item.strip()]

settings = Settings()
