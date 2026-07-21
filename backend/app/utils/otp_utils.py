# backend/app/utils/otp_utils.py
import random
import hashlib

def generate_otp() -> str:
    """Generate a random 6-digit numeric OTP string."""
    return "".join(str(random.randint(0, 9)) for _ in range(6))

def hash_otp(otp: str) -> str:
    """Hash an OTP using SHA-256."""
    return hashlib.sha256(otp.encode('utf-8')).hexdigest()

def verify_otp_hash(otp: str, hashed_otp: str) -> bool:
    """Verify an OTP against its stored SHA-256 hash."""
    return hash_otp(otp) == hashed_otp
