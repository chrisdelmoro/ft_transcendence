import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.forms.models import model_to_dict
from ..models import Game
from ..services.game_producer import send_to_queue
from ..utils.jwt import get_payload
@csrf_exempt
def find_by_user_ended(request):
	if request.method == 'GET':
		id = get_payload(request, 'user')
		games_p1 = Game.objects.filter(player1_id=id, status="Finished")
		games_p2 = Game.objects.filter(player2_id=id, status="Finished")
		res = []
		for gm in games_p1:
			res.append(model_to_dict(gm))
		for gm in games_p2:
			res.append(model_to_dict(gm))
		return JsonResponse(res, status=200, safe=False)
	else:
		return JsonResponse("Method not allowed.", status=405)


@csrf_exempt
def start_game(request):
	if request.method == 'POST':
		data = json.loads(request.body.decode('utf-8'))
		player1_id = data['player1_id']
		player2_id = data['player2_id']
		type = data['type']
		if not player1_id or not player2_id or not type:
			return JsonResponse({"Error": "Both players are required."}, status=400)
		if player1_id == player2_id:
			return JsonResponse({"Error": "Players must be different."}, status=400)
		message={
			"action": "start_game",
			"player1_id": player1_id,
			"player2_id": player2_id,
			"type": type
		}
		response = send_to_queue("START_GAME", message)
		if response is None:
			return JsonResponse({"error":"Game not found."}, status=404)
		return JsonResponse(response, status=200, safe=False)
	else:
		return JsonResponse("Only POST request are allowed.", status=400)


@csrf_exempt
def get_game(request, id):
	if request.method == 'GET':
		gm = Game.objects.filter(game_id=id).first()
		if gm is None:
			return JsonResponse({"error":"Game not found."}, status=404)
		res = model_to_dict(gm)
		res["game_id"] = str(gm.game_id)
		return JsonResponse(res, status=200, safe=False)
	else:
		return JsonResponse("Only GET request are allowed.", status=400)