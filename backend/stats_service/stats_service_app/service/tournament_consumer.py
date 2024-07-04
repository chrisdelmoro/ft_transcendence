import json
import logging

USER_STATS_QUEUE = 'USER_STATS_QUEUE'
def tournament_consumer(ch, message):
    winner = message.get('winner')
    participants = message.get('participants')
    num_game = len(message.get('games'))
    if not winner or not participants:
        print("Invalid message received, for end tournament")
        return 
    for participant in participants:
        print(participant)
        data = {
            'action': 'update_tournament_played',
            'user_id': participant["user_id"],
            'score': (participant["score"] / (num_game * 3)) * 100 
        }
        print(f"[Publishing message to {USER_STATS_QUEUE}][action: {data.get('action')}][user_id: {data.get('user_id')}]")
        ch.basic_publish(exchange='', routing_key=USER_STATS_QUEUE, body=json.dumps(data))
    for win in winner:
        data = {
            'action': 'update_tournament_winner',
            'user_id': win
        }
        print(f"[Publishing message to {USER_STATS_QUEUE}][action: {data.get('action')}][user_id: {data.get('user_id')}]")
        ch.basic_publish(exchange='', routing_key=USER_STATS_QUEUE, body=json.dumps(data))
