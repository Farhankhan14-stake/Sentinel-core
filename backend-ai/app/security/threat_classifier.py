def classify_threat(prompt: str) -> str:
    # Dummy implementation
    if "ignore" in prompt.lower():
        return "PROMPT_INJECTION"
    if "ssn" in prompt.lower():
        return "DATA_LEAK"
    return "NONE"
