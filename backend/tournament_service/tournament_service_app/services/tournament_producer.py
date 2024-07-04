from ..rabbitmq import create_connection
import json

import pika

UPDATE_STATUS = 'UPDATE_GAME'

def publish(queue_name, message, id):
    connection, channel = create_connection()
    channel.queue_declare(queue=queue_name, durable=True)

    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        properties=pika.BasicProperties(
            correlation_id=str(id)
        ),
        body=json.dumps(message, default=str),
    )

    connection.close()


