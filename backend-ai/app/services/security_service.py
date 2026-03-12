from app.security.prompt_injection_detector import detect_injection
from app.security.pii_scanner import scan_pii
from app.security.redaction_engine import redact_sensitive_data
from app.security.threat_classifier import classify_threat

def scan_prompt(prompt: str):
    is_injection = detect_injection(prompt)
    has_pii = scan_pii(prompt)
    threat_type = classify_threat(prompt)
    
    status = "CLEAN"
    sanitized_content = None
    
    if is_injection:
        status = "BLOCKED"
    elif has_pii:
        status = "REDACTED"
        sanitized_content = redact_sensitive_data(prompt)
        
    return {
        "status": status,
        "threat_type": threat_type,
        "sanitized_content": sanitized_content
    }
