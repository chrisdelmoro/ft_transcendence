from ..models.tournament import TournamentGame

def create_game(tournament, participant1, participant2, round_number, game_id, status='pending'):
    game = TournamentGame.objects.create(
        game_id=game_id,
        tournament=tournament,
        player1_id=participant1,
        player2_id=participant2,
        status='pending',
        round_number=round_number
    )
    return game