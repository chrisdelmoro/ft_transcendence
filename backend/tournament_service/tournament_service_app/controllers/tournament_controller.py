from django.forms import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from ..services.tournament_service import create_next_match, find_next_match, find_tournament_by_id
from django.http import JsonResponse
from ..models.tournament import Tournament, TournamentParticipant, TournamentGame
from ..utils.jwt import get_payload
from ..services.tournament_producer import publish

@csrf_exempt
def create_tournament(request):
    if request.method == 'POST':
        try:
            user_id = get_payload(request, 'user')
            tournament = Tournament.objects.create(status='Created')
            tp = TournamentParticipant.objects.create(tournament=tournament, user_id=user_id)
            print(tournament)
            res = model_to_dict(tournament)
            res['id'] = str(tournament.id)
            res['participants'] = [model_to_dict(tp)]
            return JsonResponse ({'tournament': res}, status=201)
        except Exception as e:
            return JsonResponse ({'Error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def add_participants(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    user_id = get_payload(request, 'user')
    if user_id is None:
        return JsonResponse({'Error': 'Invalid user id'},status=401)
    try:
        tournament = Tournament.objects.get(id=id)
        if tournament.status != 'Created':
            return JsonResponse({'Error': 'Tournament is not in the created state'},status=400)
        if TournamentParticipant.objects.filter(tournament=tournament, user_id=user_id).exists():
            return JsonResponse({'Error': 'User Already registeres in this tournament'},status=400)
        if TournamentParticipant.objects.filter(tournament=tournament).count() >= 8:
            return JsonResponse({'Error': 'Tournament is full'},status=400)
        TournamentParticipant.objects.create( tournament=tournament, user_id=user_id)
        res = model_to_dict(tournament)
        tps = TournamentParticipant.objects.filter(tournament=tournament).values('user_id')
        res["id"] = str(tournament.id)
        res["participants"] = [tp for tp in tps]
        return JsonResponse({'tournament': res}, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({'Error': 'Tournament not found'},status=404)
    except Exception as e:
        return JsonResponse({'Error': str(e)},status=400)


@csrf_exempt
def start_tournament(request, id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    try:
        tournament = Tournament.objects.get(id=id)
        if tournament is None or (tournament.status != 'Created' and tournament.status != 'Started'):
            return JsonResponse({'error': 'Tournament is not ongoing'}, status=400)
        if tournament.status == 'Started':
            return JsonResponse({'error': 'Tournament already started'}, status=200)
        response = create_next_match(tournament)
        if (response.get('error')):
            return JsonResponse(response, status=400, safe=False)
        return JsonResponse(response, status=200, safe=False)
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)

@csrf_exempt
def find_tournament(request, id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    try:
        res = find_tournament_by_id(id)
        if res is None:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        return JsonResponse(res, status=200)
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def next_match(request, id):
    if request.method != 'GET':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    try:
        response = find_next_match(id)
        if (response.get('error')):
            return JsonResponse(response, status=404, safe=False)
        return JsonResponse(response, status=200, safe=False)
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    except Exception as e:
        print(e)
        return JsonResponse({'error': str(e)}, status=500)