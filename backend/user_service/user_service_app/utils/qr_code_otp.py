import base64
import hmac
import hashlib
import struct
import time

def generate_otp(secret, interval=30, counter=None):
    if counter is None:
        counter = int(time.time() // interval)
    secret = secret + '=' * ((8 - len(secret) % 8) % 8)  # Adiciona padding ao secret
    key = base64.b32decode(secret, True)
    msg = struct.pack(">Q", counter)
    hmac_hash = hmac.new(key, msg, hashlib.sha1).digest()
    offset = hmac_hash[-1] & 0x0F
    code = (struct.unpack(">I", hmac_hash[offset:offset + 4])[0] & 0x7FFFFFFF) % 1000000
    return f"{code:06d}"

def generate_secret(length=16):
    import secrets
    return base64.b32encode(secrets.token_bytes(length)).decode('utf-8').strip('=')

def verify_otp(secret, otp, interval=30, window=20):
    secret = secret + '=' * ((8 - len(secret) % 8) % 8)  # Adiciona padding ao secret
    for i in range(-window, window + 1):
        counter = int(time.time() // interval) + i
        if generate_otp(secret, interval, counter) == otp:
            return True
    return False