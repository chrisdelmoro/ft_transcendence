import json
import pika
from django.utils import timezone
import pika.exceptions
from ..rabbitmq import create_connection
from ..models import Game
from django.forms.models import model_to_dict
import logging
import time
UPDATE_QUEUE = 'UPDATE_GAME_TOURNAMENT'
FINISHED_QUEUE = 'FINISHED_GAME_TOURNAMENT'

STATS_QUEUE = 'STATS_QUEUE'

def start_game_local(data, status='active'):

    player1_id = data.get('player1_id')
    player2_id = data.get('player2_id')
    type = data.get('type')
    game = Game.objects.create(
        player1_id = player1_id,
        player2_id = player2_id,
        type = type,
        status=status,
    )
    response = model_to_dict(game)
    response['game_id'] = str(game.game_id)
    return { 'game': response }

def update_game(data):
    score_player1 = data.get('score_player1')
    score_player2 = data.get('score_player2')
    end = data.get('end', False)
    id = data.get('id')
    game = Game.objects.filter(game_id=id).first()
    is_end_now = False
    if (game is None):
        return {'status': 'error', 'message': 'Game not found'}
    if game.status == 'active':
        print("game is active")
        game.score_player1 = score_player1
        game.score_player2 = score_player2
        if end == True and game.end_time == None:
            game.end_time = timezone.now()
            is_end_now = True
            game.status = 'Finished'
    game.save()
    response = model_to_dict(game)
    response['end_time'] = str(game.end_time)
    response['winner'] = str(data.get('winner'))
    print("response: ", data.get('winner'))
    response['game_id'] = str(game.game_id)
    response['player1_id'] = str(game.player1_id)
    response['player2_id'] = str(game.player2_id)
    return { 'game': response }, is_end_now


def on_request(ch, method, props, body):
    data = json.loads(body)
    action = data.get('action')
    print(f"[Received message from START_GAME][action: {action}]")
    if action == 'start_game':
        response = start_game_local(data)
    elif action == 'update_game':
        print("test")
        response, ended = update_game(data)
        print("test2")
        if (response.get('game').get('status') == 'Finished' and data.get('end') == True):
            print(f"Game has ended [posting to stats]")
            response['action'] = 'end_game'
            ch.basic_publish(exchange='', routing_key=STATS_QUEUE, body=json.dumps(response))
            if (response.get('game').get('type') == 'tournament'):
                print(f"Game has ended [posting to tournament]")
                ch.basic_publish(
                    exchange = '',
                    routing_key = FINISHED_QUEUE,
                    properties = pika.BasicProperties(correlation_id=props.correlation_id),
                    body = json.dumps(response)
                )
    else:
        print(f"Invalid message received, for start game or update game[action: {action}]")
        response = {'status': 'error', 'message': 'Unknown action'}
    print(f"[Publishing message to {UPDATE_QUEUE}][action: {response.get('game').get('status')}]")
    ch.basic_publish(
        exchange = '',
        routing_key = props.reply_to,
        properties = pika.BasicProperties(correlation_id=props.correlation_id),
        body = json.dumps(response)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

def on_tournament_request(ch, method, props, body):
    data = json.loads(body)
    print(f"[Received message from TOURNAMENT_GAME][action: {data.get('action')}]")
    action = data.get('action')
    if action == 'create_game':
        response = start_game_local(data, status='pending')
        response['round_number'] = data.get('round_number')
    elif action == 'start_game':
        id = data.get('id')
        game = Game.objects.filter(game_id=id).first()
        if game is None:
            response = {'status': 'error', 'message': 'Game not found'}
        game.status = 'active'
        game.save()
        response = model_to_dict(game)
        response['game_id'] = str(game.game_id)
        response['player1_id'] = str(game.player1_id)
        response['player2_id'] = str(game.player2_id)
    else :
        print("error on action")
        response = {'status': 'error', 'message': 'Unknown action'}
    response['action'] = action
    response['tournament_id'] = data.get('tournament_id')
    print(f"[Publishing message to {UPDATE_QUEUE}][action: {response.get('action')}]")
    ch.basic_publish(
        exchange = '',
        routing_key = UPDATE_QUEUE,
        properties = pika.BasicProperties(correlation_id=props.correlation_id),
        body = json.dumps(response)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

def start_consumer():
    while True:
        try:
            _, channel = create_connection()
            channel.basic_qos(prefetch_count=1)
            channel.queue_declare(queue='START_GAME', durable=True)
            channel.queue_declare(queue='TOURNAMENT_GAME', durable=True)
            channel.basic_consume(queue='START_GAME', on_message_callback=on_request)
            channel.basic_consume(queue='TOURNAMENT_GAME', on_message_callback=on_tournament_request)
            print("[X] Awating RCP request...")
            channel.start_consuming()
        except pika.exceptions.ConnectionClosedByBroker as e:
            
            time.sleep(20)
        except pika.exceptions.AMQPConnectionError as e:
            
            time.sleep(20)
        except Exception as e:
            time.sleep(20)

if __name__ == '__main__':
    start_consumer()
