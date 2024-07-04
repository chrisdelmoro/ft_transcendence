# auth_app/views.py
import base64
import hashlib
from datetime import datetime, timedelta
import hmac
import os
import json

secret_key = os.getenv('SECRET_KEY', "err")

def generate_jwt_token(user):
    header = base64.urlsafe_b64encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode()).decode().strip('=')
    payload = base64.urlsafe_b64encode(json.dumps({
        "user": user,
        "exp": int((datetime.utcnow() + timedelta(hours=24)).timestamp())
    }).encode()).decode().strip('=')
    signature = base64.urlsafe_b64encode(hmac.new(secret_key.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()).decode().strip('=')

    return f"{header}.{payload}.{signature}"

def decode_jwt(token):
    header, payload, signature = token.split('.')

    expected_signature = base64.urlsafe_b64encode(
        hmac.new(secret_key.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    ).decode().strip('=')

    if signature != expected_signature:
        return None, "Invalid Token", 401

    payload_data = json.loads(base64.urlsafe_b64decode(payload + '=='))

    if datetime.utcnow().timestamp() > payload_data['exp']:
        return None, "Token expired", 401
    return payload_data, "Token Valid", 200

