from ..models import PlayerStats
from django.forms.models import model_to_dict
def endGameUpdate(data):
    id = data.get('user_id')
    win = data.get('winner')
    pls = PlayerStats.objects.filter(user_id=id).first()
    if pls is None:
        return {'status': 'error', 'message': 'PlayerStats not found'}
    if win:
        pls.games_won += 1
    pls.games_played += 1
    pls.save()

def tournnament_played(data):
    id = data.get('user_id')
    score = data.get('score')
    pls = PlayerStats.objects.filter(user_id=id).first()
    print(model_to_dict(pls))
    if pls is None:
        return {'status': 'error', 'message': 'PlayerStats not found'}
    pls.tournament_played += 1
    pls.tournament_point_porcent += ((((pls.tournament_point_porcent / 100) * pls.tournament_played - 1) + (score/ 100)) / (pls.tournament_played)) * 100
    pls.save()

def tournnament_won(data):
    id = data.get('user_id')
    pls = PlayerStats.objects.filter(user_id=id).first()
    if pls is None:
        return {'status': 'error', 'message': 'PlayerStats not found'}
    pls.tournament_won += 1
    pls.save()
