import json
import base64

def get_payload(request, field):
	auth_header = request.headers.get('Authorization')

	if not auth_header or not auth_header.startswith('Bearer '):
		return None
	token = auth_header.split(' ')[1]
	_, payload, _ = token.split('.')
	payload_data = json.loads(base64.urlsafe_b64decode(payload + '=='))
	return payload_data[field]