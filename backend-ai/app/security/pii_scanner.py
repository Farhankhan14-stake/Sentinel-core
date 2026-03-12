def scan_pii(prompt: str) -> bool:
    # Dummy implementation
    pii_keywords = ["ssn", "credit card", "password"]
    return any(kw in prompt.lower() for kw in pii_keywords)
