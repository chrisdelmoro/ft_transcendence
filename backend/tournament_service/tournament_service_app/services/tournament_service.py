from ..models.tournament import Tournament, TournamentParticipant, TournamentGame
from .tournament_producer import publish
from django.forms.models import model_to_dict
from django.db.models import Max
import json
import random

USER_STATS_QUEUE = 'STATS_QUEUE'

def create_next_match(tournamet):
    if (tournamet.status == 'Created'):
        participants = TournamentParticipant.objects.filter(tournament=tournamet)
        if len(participants) < 3 or len(participants) > 8:
            return {'error': 'Number of participants is less than 3'}
        matches = TournamentGame.objects.filter(tournament=tournamet)
        if len(matches) > 0:
            return {'error': 'Round already started'}
        round_number = 1
        round_combinations = get_round_combinations(participants)   
        tournamet.status = 'Started'
        tournamet.round_now = 1
        tournamet.save()     
        for player1, player2 in round_combinations:
            print(player1, player2, round_number, "\n")
            message={
                "action": "create_game",
                "player1_id": str(player1.user_id),
                "player2_id": str(player2.user_id),
                "round_number": round_number,
                "type": "tournament",
                "tournament_id": str(tournamet.id)
            }
            publish("TOURNAMENT_GAME", message, str(tournamet.id))
            round_number += 1
        
        return { "tournament": model_to_dict(tournamet)}
    else:
        return {'error': 'Error on tournament status is not created'}
        
def get_round_combinations(participants):
    combinations_per_round = []
    
    for i in range(len(participants)):
        for j in range(i+1, len(participants)):
            combinations_per_round.append((participants[i], participants[j]))
    random.shuffle(combinations_per_round)
    return combinations_per_round


def find_next_match(tournament_id):
    tournament = Tournament.objects.get(id=tournament_id)
    if tournament.status != 'Started' and tournament.status != 'ongoing':
        return {'status': 'finished'}
    matches = TournamentGame.objects.filter(tournament=tournament, round_number=tournament.round_now).first()
    if matches is None: 
        if tournament.status != 'finished':
            tournament.status = 'finished'
            data =  find_tournament_by_id(tournament_id)
            max_score = TournamentParticipant.objects.all().aggregate(Max('score'))['score__max']
            winners = TournamentParticipant.objects.filter(score=max_score)
            data['winner'] = [str(winner.user_id) for winner in winners]
            print("publish to user stats")
            publish(USER_STATS_QUEUE, {
                'action': 'tournament_finished',
                'message': data
            }, tournament_id)
        tournament.save()
        return {"status": "finished"}
    if matches.status == 'pending':
        message = {
            'action': 'start_game',
            'id': str(matches.game_id),
        }
        publish("TOURNAMENT_GAME", message, str(tournament.id))
        matches.save()
        res = model_to_dict(matches)
    elif matches.status == 'active':
        res = model_to_dict(matches)
    elif matches.status == 'finished':
        tournament.round_now += 1
        tournament.save()
        return find_next_match(tournament_id)
    else :
        return {'error': 'Error on match status'}
    res['id'] = str(matches.id)
    res['game_id'] = str(matches.game_id)
    res['player1'] = model_to_dict(TournamentParticipant.objects.filter(id=str(matches.player1_id)).first())
    res['player2'] = model_to_dict(TournamentParticipant.objects.filter(id=str(matches.player2_id)).first())
    return { "game": res }


def find_tournament_by_id(id):
    tournament = Tournament.objects.get(id=id)
    if (tournament is None):
        return None
    participantes = TournamentParticipant.objects.filter(tournament=tournament)
    games = TournamentGame.objects.filter(tournament=tournament)
    res = model_to_dict(tournament)
    if tournament.status == 'Finished':
        winner = max(participantes, key=lambda tp: tp.score)
        res['winner'] = model_to_dict(winner)
        res['winner']['id'] = str(winner.id)
    res['id'] = str(tournament.id)
    res['participants'] = [model_to_dict(tp) for tp in participantes]
    res['games'] = [model_to_dict(tg) for tg in games]
    return res
        