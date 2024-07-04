import json
import pika
from ..rabbitmq import create_connection
import uuid
import time

TIMEOUT_SECONDS = 10

def authenticate_user(credentials):
    connection, channel = create_connection()
    queue_name = 'AUTH_USER'
    
    channel.queue_declare(queue=queue_name)
    response = None
    response_queue = channel.queue_declare(queue= queue_name + 'RESPONSE', exclusive=True).method.queue

    correlation_id = str(uuid.uuid4())

    def on_response(ch, method, properties, body):
        nonlocal response
        if correlation_id == properties.correlation_id:
            response = json.loads(body)
            ch.stop_consuming()

    channel.basic_consume(
        queue=response_queue,
        on_message_callback=on_response,
        auto_ack=True
    )

    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        properties=pika.BasicProperties(
            reply_to=response_queue,
            correlation_id=correlation_id
        ),
        body=json.dumps(credentials)
    )

    start_time = time.time()
    while response is None and (time.time() - start_time) < TIMEOUT_SECONDS:
        connection.process_data_events(time_limit=1)  # Processa eventos por até 1 segundo
    print("Response: ", response)
    if response is None:
        print("Timeout occurred, no response received.")
        channel.stop_consuming()
        connection.close()
        return None
    connection.close()
    return response
