from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.ai_service import get_security_analysis
from app.models.scan import ScanJob
from app.services.security_service import scan_prompt


def create_scan_record(db: Session, user_id: int, target: str, scan_type: str = "prompt"):
    scan_result = scan_prompt(target)
    analysis = None if scan_result["status"] == "BLOCKED" else get_security_analysis(
        scan_result["sanitized_content"] or target
    )
    record = ScanJob(
        user_id=user_id,
        scan_type=scan_type,
        target=target,
        status=scan_result["status"].lower(),
        result={
            "scan_result": scan_result,
            "analysis": analysis,
        },
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_scan_record(db: Session, user_id: int, scan_id: int):
    record = db.query(ScanJob).filter(ScanJob.id == scan_id, ScanJob.user_id == user_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return record


def list_scan_history(db: Session, user_id: int, limit: int = 100):
    return (
        db.query(ScanJob)
        .filter(ScanJob.user_id == user_id)
        .order_by(ScanJob.created_at.desc())
        .limit(limit)
        .all()
    )
