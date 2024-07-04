from django.views.decorators.csrf import csrf_exempt
from ..utils.jwt import get_payload
from ..services.two_fa_service import generate_qr_code
from django.http import JsonResponse



@csrf_exempt
def qr_generator(request):
	if request.method != 'GET':
		return JsonResponse(status=405)
	user = get_payload(request, 'user')
	if user:
		return generate_qr_code(user)
	else:
		return JsonResponse(status=404)