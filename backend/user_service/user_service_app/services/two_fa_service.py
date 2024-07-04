from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from ..utils.qr_code_otp import generate_secret
from ..models.user import User
import urllib

def generate_qr_code(user):
    secret = generate_secret()
    user_db = User.objects.get(user_id=user)

    # Salve a chave secreta no perfil do usuário
    user_db.otp_secret = secret
    user_db.save()
    otp_uri = f'otpauth://totp/{urllib.parse.quote(user_db.username)}?secret={secret}&issuer=Pong'

    # Gerar o QR Code em SVG

    return JsonResponse({'otp_uri': otp_uri}, status=200)
