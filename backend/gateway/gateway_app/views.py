
import http.client
from django.http import JsonResponse, HttpResponse
from urllib.parse import urlparse, urlencode
from django.views import View

# Create your views here.
class ProxyView(View):
    service_mapping = {
        '/public/user/': 'http://user-service:8000',
        '/public/auth/': 'http://auth-service:8000',
        '/protected/auth/': 'http://auth-service:8000',
        '/protected/user/': 'http://user-service:8000',
        '/protected/game/': 'http://game-service:8000',
        '/public/static/': 'http://user-service:8000',
        '/protected/tournament/': 'http://tournament-service:8000',
    }

    def get_service_url(self, path):
        for key in self.service_mapping.keys():
            if path.startswith(key):
                if not path.endswith('/') and key != '/public/static/':
                    path += '/'
                return self.service_mapping[key] + path[len(key.split('/', 2)[1]) + 1:]
        return None

    def forward_request(self, request):
        service_url = self.get_service_url(request.path)
        print(service_url)
        if not service_url:
            return JsonResponse({'error': 'Service not found'}, status=404)
        
        parsed_url = urlparse(service_url)
        conn = http.client.HTTPConnection(parsed_url.hostname, parsed_url.port)

        # Prepare headers
        headers = {key: value for key, value in request.headers.items() if key != 'Host'}
        if 'Content-Length' in headers:
            headers['Content-Length'] = str(len(request.body))

        # Prepare URL with query parameters
        url = parsed_url.path
        if request.GET:
            url += '?' + urlencode(request.GET)

        try:
            conn.request(method=request.method, url=url, body=request.body, headers=headers)
            response = conn.getresponse()
            response_data = response.read()
            conn.close()
            return HttpResponse(response_data, status=response.status, content_type=response.getheader('Content-Type'))
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        finally:
            conn.close()

    def get(self, request, *args, **kwargs):
        return self.forward_request(request)

    def post(self, request, *args, **kwargs):
        return self.forward_request(request)

    def put(self, request, *args, **kwargs):
        return self.forward_request(request)

    def delete(self, request, *args, **kwargs):
        return self.forward_request(request)

    def patch(self, request, *args, **kwargs):
        return self.forward_request(request)