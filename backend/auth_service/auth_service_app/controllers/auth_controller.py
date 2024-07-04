import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..service.auth_service import login_service, login_42_service, verify_2fa_secret
from ..utils.jwt import decode_jwt, generate_jwt_token

@csrf_exempt
def verify_jwt_token(request):
    if request.method != 'GET':
        return JsonResponse({"message":"Only GET requests are allowed"}, 405)
    token = request.headers.get('X-Auth-Token')
    if not token:
        return JsonResponse({'error': 'Authorization header missing or malformed'}, status=401)
    try:
        _, strn, status = decode_jwt(token)
        return JsonResponse({'message': strn}, status=status)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def login(request):
    if request.method != 'POST':
        return JsonResponse("Only POST requests are allowed", 405)
    else:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required'}, status=401)
        res = login_service(username, password)
        if (res["valid"] == False and res):
            return JsonResponse({'error': 'Failed to retrieve access token'}, status=401)
        elif (res["valid"] == True and res["user"]["is_auth"] == True):
            return JsonResponse({'2af_auth': "required", "email": res["user"]["email"]}, status=200)
        elif (res["valid"] == True and res["user"]):
            return JsonResponse({'jwt_token': generate_jwt_token(res["user"]["user_id"])})
        return JsonResponse({'error': 'Failed to retrieve user info'}, status=401)

@csrf_exempt
def oauth_callback(request):
    if request.method != 'POST':
        return JsonResponse("Only POST requests are allowed", 405)
    code =  json.loads(request.body).get('code')
    client_id = os.getenv('CLIENT_42_ID', 'err')
    client_secret = os.getenv('CLIENT_42_SECRET', 'err')
    redirect_uri = json.loads(request.body).get('redirect_uri')

    if client_id == 'err' or client_secret == 'err':
        return JsonResponse({'error': '42 Client ID or 42 Client Secret not found'}, status=400)
    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri
    }
    try:
        res = login_42_service(data)
        if (res["valid"] == False and res):
            return JsonResponse({'error': 'Failed to retrieve access token'}, status=401)
        elif (res["valid"] == True and res["user"]["is_auth"] == True):
            return JsonResponse({'2af_auth': "required", "email": res["user"]["email"]}, status=200)
        elif (res["valid"] == True and res["user"]):
            return JsonResponse({'jwt_token': generate_jwt_token(res["user"]["user_id"])})
        return JsonResponse({'error': 'Failed to retrieve user info'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

@csrf_exempt
def verify_2fa(request):
    if request.method != 'POST':
        return JsonResponse("Only POST requests are allowed", 405)
    data = json.loads(request.body)
    payload, _, _ = decode_jwt(request.headers.get('Authorization').split(' ')[1])
    if not payload:
        return JsonResponse({'error': 'Invalid token'}, status=401)
    token = data.get('token')
    if not token:
        return JsonResponse({'error': 'Token is required'}, status=404)
    try:
        res = verify_2fa_secret(token, payload['user'], 'verify_2fa_secret')
        if (res.get('valid') == False):
            return JsonResponse({'error': 'Timezone Error'}, status=409)
        return JsonResponse({'user': res}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def login_2fa(request):
    if request.method != 'POST':
        return JsonResponse("Only POST requests are allowed", 405)
    data = json.loads(request.body)
    email = data.get('email')
    token = data.get('token')

    if not email or not token:
        return JsonResponse({'error': 'code are required'}, status=401)
    try:
        res = verify_2fa_secret(token, email, 'login_2fa')
        if res["valid"] == True and res["user"]:
            return JsonResponse({'jwt_token': generate_jwt_token(res["user"]["user_id"])})
        return JsonResponse({'error': 'Failed to retrieve user info'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=401)

