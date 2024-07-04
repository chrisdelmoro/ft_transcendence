from ..rabbitmq import create_connection
import pika
import pika.exceptions
import json
import logging
import time
from .tournament_consumer import tournament_consumer
from .game_consumer import game_consumer

STATS_QUEUE = 'STATS_QUEUE'

def on_request(ch, method, props, body):
    data = json.loads(body)

    print(f"[Received message from {STATS_QUEUE}][action: {data.get('action')}]")
    if data.get('action') == 'tournament_finished':
        tournament_consumer(ch, data.get('message'))
    elif data.get('action') == 'end_game':
        game_consumer(ch, data.get('game'))
    else:
        print(f"Invalid message received, for end game or tournament[action: {data.get('action')}]")
    ch.basic_ack(delivery_tag=method.delivery_tag)


def consumer():
    while True:
        try:
            _, channel = create_connection()
            channel.basic_qos(prefetch_count=1)
            channel.queue_declare(queue=STATS_QUEUE, durable=True)
            channel.basic_consume(queue=STATS_QUEUE, on_message_callback=on_request)
            print("[X] Awaiting RPC request...")
            channel.start_consuming()
        except pika.exceptions.ConnectionClosedByBroker as e:
            
            time.sleep(20)
        except pika.exceptions.AMQPConnectionError as e:
            
            time.sleep(20)
        except Exception as e:
            time.sleep(20)