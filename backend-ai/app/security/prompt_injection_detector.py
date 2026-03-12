def detect_injection(prompt: str) -> bool:
    # Dummy implementation
    suspicious_keywords = ["ignore previous", "system prompt", "bypass"]
    return any(kw in prompt.lower() for kw in suspicious_keywords)
