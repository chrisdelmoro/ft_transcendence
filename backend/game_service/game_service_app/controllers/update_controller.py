import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from ..services.game_producer import send_to_queue

@csrf_exempt
def update_game(request, id):
	if request.method != 'PUT':
		return JsonResponse({"error": "Only POST request are allowed."}, status=405)
	data = json.loads(request.body.decode('utf-8'))
	score_player1 = data.get('score_player1')
	score_player2 = data.get('score_player2')
	end = data.get('end')
	if not "score_player1" in data or not "score_player2" in data:
		return JsonResponse({"Error": "Score games are required."}, status=400)
	print("data: ", data.get('winner'))
	message={
		"action": "update_game",
		"score_player1": score_player1,
		"score_player2": score_player2,
		"id": str(id),
		"winner": str(data.get('winner')),
		"end": end
	}
	response = send_to_queue("START_GAME", message)
	if response is None:
		return JsonResponse({"error":"Game not found."}, status=404)
	return JsonResponse(response, status=200, safe=False)
