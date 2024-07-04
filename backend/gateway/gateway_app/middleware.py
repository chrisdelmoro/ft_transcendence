import http.client
from urllib.parse import urlparse
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

class DisableCSRF(MiddlewareMixin):
    def process_request(self, request):
        setattr(request, '_dont_enforce_csrf_checks', True)


class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.auth_required_prefixes = [
            '/protected/',  # Example: all routes starting with /protected/
        ]
        # Define the route prefixes that do not require authentication
        self.public_prefixes = [
            '/public/user/create',
            '/public/auth/login/code',
            '/public/auth/login',
            '/public/auth/oauth2/authorize',
            '/metrics' # Example: all routes starting with /public/
        ]


    def __call__(self, request):
        path = request.path_info
        # Check if the path matches any public prefixes
        if any(path.startswith(prefix) for prefix in self.public_prefixes):
            # Skip authentication for public routes
            return self.get_response(request)
        if path.startswith('/public/static/'):
            return self.get_response(request)
        # Check if the path matches any auth-required prefixes
        if any(path.startswith(prefix) for prefix in self.auth_required_prefixes):
            bearer = request.headers.get('Authorization', None)
            if bearer:
                try:
                    token = bearer.split(' ')[1]
                    if (token == ''):
                        return JsonResponse({'error': 'Invalid token'}, status=401)

                    # Prepare connection and request
                    parsed_url = urlparse('http://auth-service:8000/auth/authorized/')
                    conn = http.client.HTTPConnection(parsed_url.hostname, parsed_url.port)
                    headers = {'X-Auth-Token': token}
                    conn.request("GET", parsed_url.path, headers=headers)

                    # Get response
                    response = conn.getresponse()
                    if response.status != 200:
                        return JsonResponse({'error': 'Invalid token'}, status=401)
                    conn.close()
                    return self.get_response(request)
                except Exception as e:
                    conn.close()
                    return JsonResponse({'error': str(e)}, status=500)
                finally:
                    conn.close()
        return JsonResponse({'error': 'No token provided'}, status=401)

