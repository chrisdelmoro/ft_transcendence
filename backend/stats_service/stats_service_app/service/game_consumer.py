import logging
import json


USER_STATS_QUEUE = 'USER_STATS_QUEUE'
def game_consumer(ch, message):
    player1 = message.get('player1_id')
    player2 = message.get('player2_id')
    winner = message.get('winner')

    if not player1 or not player2:
        print("Invalid message received, for end game")
        return
    data = {
        'action': 'update_game_played',
        'user_id': player1,
        'winner': winner == player1
    }
    print(f"[Publishing message to {USER_STATS_QUEUE}][action: {data.get('action')}][user_id: {data.get('user_id')}]")
    ch.basic_publish(exchange='', routing_key=USER_STATS_QUEUE, body=json.dumps(data))
    data = {
        'action': 'update_game_played',
        'user_id': player2,
        'winner': winner == player2
    }
    print(f"[Publishing message to {USER_STATS_QUEUE}][action: {data.get('action')}][user_id: {data.get('user_id')}]")
    ch.basic_publish(exchange='', routing_key=USER_STATS_QUEUE, body=json.dumps(data))
    