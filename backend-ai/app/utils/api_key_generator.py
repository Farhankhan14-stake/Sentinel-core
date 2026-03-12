import secrets
import string

def generate_api_key(prefix="sk_live_"):
    alphabet = string.ascii_letters + string.digits
    key = ''.join(secrets.choice(alphabet) for _ in range(32))
    return f"{prefix}{key}"
