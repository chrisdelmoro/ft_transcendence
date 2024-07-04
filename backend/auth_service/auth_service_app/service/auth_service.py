import json
from urllib.parse import urlencode
import http.client
from .auth_user_consumer import authenticate_user

def login_service(username, password):
    credentials = {'username': username, 'password': password, 'action': 'authenticate'}
    return authenticate_user(credentials)

def verify_2fa_secret(token, user_data, action):
    data = {'action': action, 'token': token, 'user_id': user_data}
    return authenticate_user(data)

def login_42_service(user_data):
    host_42 = 'api.intra.42.fr'
    token_path = '/oauth/token'
    conn = http.client.HTTPSConnection(host_42)
    headers = {'Content-type': 'application/x-www-form-urlencoded'}
    conn.request('POST', token_path, urlencode(user_data), headers)
    response = conn.getresponse()
    token_response = response.read().decode()
    token_json = json.loads(token_response)
    access_token = token_json.get('access_token')
    conn.close()
    if access_token:
        user_info_path = '/v2/me'
        conn = http.client.HTTPSConnection(host_42)
        headers = {'Authorization': f'Bearer {access_token}'}
        conn.request('GET', user_info_path, headers=headers)
        response = conn.getresponse()
        user_info_response = response.read().decode()
        user_info = json.loads(user_info_response)
        conn.close()
        user_info['action'] = 'authenticate_or_register'
        return authenticate_user(user_info)
    return None




