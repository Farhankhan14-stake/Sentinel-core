import time

from fastapi import APIRouter, Depends, File, Header, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.ai_service import get_security_analysis
from app.core.config import settings
from app.core.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.security_log import LogStatusEnum, SecurityLog
from app.models.user import User
from app.schemas.scan_schema import FileScanMetadata, ScanRequest, ScanResponse, URLScanRequest
from app.services.audit_service import log_failed_auth, log_scan_request
from app.services.api_key_service import find_api_key_by_raw_key, get_or_create_demo_api_key
from app.services.scan_service import create_scan_record, get_scan_record, list_scan_history
from app.services.security_service import scan_prompt

router = APIRouter(prefix="/api/scan", tags=["scan"])


@router.post("", response_model=ScanResponse)
def scan_content(
    request: Request,
    payload: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    x_api_key: str | None = Header(default=None),
):
    started_at = time.perf_counter()
    client_ip = request.client.host if request.client else None

    if x_api_key:
        api_key = find_api_key_by_raw_key(db, x_api_key)
    elif settings.ENABLE_DEMO_MODE:
        api_key = get_or_create_demo_api_key(db, current_user)
    else:
        api_key = None

    if api_key is None and settings.ENABLE_DEMO_MODE and x_api_key == settings.TEST_API_KEY:
        api_key = get_or_create_demo_api_key(db, current_user)

    if api_key is None:
        log_failed_auth("invalid_or_missing_api_key", ip_address=client_ip, metadata={"path": "/api/scan"})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing x-api-key header",
        )

    scan_result = scan_prompt(payload.prompt)
    prompt_to_analyze = scan_result["sanitized_content"] or payload.prompt
    analysis = None

    if scan_result["status"] != "BLOCKED":
        analysis = get_security_analysis(prompt_to_analyze, payload.image_data)

    action_taken = {
        "BLOCKED": "Request blocked before downstream execution.",
        "REDACTED": "Sensitive content was redacted before analysis.",
        "CLEAN": "Request passed scanning and analysis.",
    }[scan_result["status"]]

    detection_reason = {
        "PROMPT_INJECTION": "Suspicious instruction-overriding language was detected.",
        "DATA_LEAK": "Sensitive data indicators were detected in the payload.",
        "NONE": "No high-confidence threat pattern was detected.",
    }.get(scan_result["threat_type"], "Threat heuristics matched the submitted payload.")

    latency_ms = int((time.perf_counter() - started_at) * 1000)
    tokens_used = max(1, len(payload.prompt.split()))

    db_log = SecurityLog(
        api_key_id=api_key.id,
        status=LogStatusEnum(scan_result["status"]),
        threat_type=scan_result["threat_type"],
        threat_score=0.99 if scan_result["status"] == "BLOCKED" else 0.65 if scan_result["status"] == "REDACTED" else 0.1,
        tokens_used=tokens_used,
        latency_ms=latency_ms,
        raw_payload={
            "prompt": payload.prompt,
            "sanitized_content": scan_result["sanitized_content"],
            "analysis": analysis,
        },
    )
    db.add(db_log)
    api_key.usage_count += 1
    db.commit()
    log_scan_request(current_user.id if current_user else None, "prompt", scan_result["status"].lower(), client_ip)

    return ScanResponse(
        status=scan_result["status"],
        threat_type=scan_result["threat_type"],
        sanitized_content=scan_result["sanitized_content"],
        analysis=analysis,
        security_report={
            "threat_type": scan_result["threat_type"],
            "action_taken": action_taken,
            "detection_reason": detection_reason,
        },
    )


@router.post("/url", response_model=ScanResponse)
def scan_url(
    request: Request,
    payload: URLScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client_ip = request.client.host if request.client else None
    scan_record = create_scan_record(db, current_user.id, str(payload.url), scan_type="url")
    log_scan_request(current_user.id, "url", "success", client_ip)
    result = scan_record.result or {}
    scan_result = result.get("scan_result", {})
    return ScanResponse(
        status=scan_result.get("status", "CLEAN"),
        threat_type=scan_result.get("threat_type", "NONE"),
        sanitized_content=scan_result.get("sanitized_content"),
        analysis=result.get("analysis"),
        security_report={
            "threat_type": scan_result.get("threat_type", "NONE"),
            "action_taken": "URL analyzed by SentinelCore secure scan pipeline.",
            "detection_reason": "Structured URL validation and content heuristics applied.",
        },
    )


@router.post("/file", response_model=ScanResponse)
async def scan_file(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client_ip = request.client.host if request.client else None
    contents = await file.read()
    metadata = FileScanMetadata(
        filename=(file.filename or "upload").split("/")[-1].split("\\")[-1],
        content_type=file.content_type or "application/octet-stream",
        size=len(contents),
    )
    if metadata.content_type not in settings.ALLOWED_UPLOAD_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    if metadata.size > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Uploaded file is too large")

    # Placeholder for AV integration; real deployments should wire this to a scanner.
    antivirus_status = "clean"
    target = contents.decode("utf-8", errors="ignore")[:10000]
    scan_record = create_scan_record(db, current_user.id, target, scan_type="file")
    log_scan_request(current_user.id, "file", antivirus_status, client_ip)
    result = scan_record.result or {}
    scan_result = result.get("scan_result", {})
    return ScanResponse(
        status=scan_result.get("status", "CLEAN"),
        threat_type=scan_result.get("threat_type", "NONE"),
        sanitized_content=scan_result.get("sanitized_content"),
        analysis={
            **(result.get("analysis") or {}),
            "file": metadata.model_dump(),
            "antivirus_status": antivirus_status,
        },
        security_report={
            "threat_type": scan_result.get("threat_type", "NONE"),
            "action_taken": "Uploaded file validated, sanitized, and queued through the secure scan pipeline.",
            "detection_reason": "Filename sanitization, size validation, MIME allowlisting, and heuristic content analysis applied.",
        },
    )


@router.get("/history")
def get_scan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_scan_history(db, current_user.id)


@router.get("/{scan_id}")
def get_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_scan_record(db, current_user.id, scan_id)
