import logging
import time

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette import status

from app.ai_service import get_security_analysis
from app.core.config import settings
from app.core.database import engine, Base
from app.middleware.auth_middleware import attach_security_context
from app.middleware.rate_limiter import check_rate_limit
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routers import auth_router, user_router, api_keys_router, logs_router, billing_router
from app.routers.analytics_router import router as analytics_router
from app.routers.frontend_router import router as frontend_router
from app.routers.scan_router import router as scan_router
from app.services.audit_service import audit_event

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Sentinel",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware, enable_hsts=settings.HSTS_ENABLED)


PATH_LIMITS = (
    ("/api/auth/login", 5, 60),
    ("/analyze", 20, 60),
    ("/api/scan", 10, 60),
)


def _resolve_client_identifier(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.middleware("http")
async def log_requests(request: Request, call_next):
    client_id = _resolve_client_identifier(request)
    content_length = request.headers.get("content-length")
    max_size = settings.MAX_UPLOAD_SIZE_BYTES if request.url.path.startswith("/api/scan/file") else settings.MAX_REQUEST_SIZE_BYTES
    if content_length and int(content_length) > max_size:
        return JSONResponse(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, content={"detail": "Request too large"})

    for path, limit, window in PATH_LIMITS:
        if request.method == "POST" and request.url.path.startswith(path):
            try:
                check_rate_limit(client_id, f"{request.method}:{path}", limit, window)
            except HTTPException as exc:
                return JSONResponse(
                    status_code=exc.status_code,
                    content={"detail": exc.detail},
                    headers=exc.headers,
                )

    start = time.perf_counter()
    response = await attach_security_context(request, call_next)
    duration_ms = int((time.perf_counter() - start) * 1000)
    logger.info("%s %s -> %s (%sms)", request.method, request.url.path, response.status_code, duration_ms)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning("Validation error on %s: %s", request.url.path, exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Request validation failed"},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s", request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )

# Request Schema for AI Analysis
class SecurityRequest(BaseModel):
    prompt: str
    image_data: str | None = None  # Optional field for visual security analysis

# Include existing Routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(api_keys_router.router)
app.include_router(logs_router.router)
app.include_router(billing_router.router)
app.include_router(analytics_router)
app.include_router(scan_router)
app.include_router(frontend_router)

# --- New AI Security Endpoint ---
@app.post("/analyze", tags=["Security"])
async def analyze_threat(request: SecurityRequest):
    try:
        audit_event("analyze_request", outcome="received", metadata={"prompt_length": len(request.prompt)})
        # Call the logic defined in your ai_service.py
        analysis_result = get_security_analysis(request.prompt, request.image_data)
        return {"status": "success", "analysis": analysis_result}
    except Exception:
        logger.exception("AI analysis failed")
        raise HTTPException(status_code=500, detail="Threat analysis failed")

@app.get("/")
def root():
    return {"message": "Welcome to Sentinel AI Security Gateway API"}
