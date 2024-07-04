from django.views.decorators.csrf import csrf_exempt
from ..rabbitmq import create_connection
import json
import pika
import uuid
import time



def send_to_queue(queue_name, message):
    connection, channel = create_connection()
    channel.queue_declare(queue=queue_name, durable=True)
    callback_queue=channel.queue_declare(queue=queue_name+"_RESPONSE").method.queue
    correlation_id = str(uuid.uuid4())
    response = None

    def on_response(ch, method, properties, body):
        nonlocal response
        if correlation_id == properties.correlation_id:
            response = json.loads(body)
            ch.stop_consuming()

    channel.basic_consume(
        queue=callback_queue,
        on_message_callback=on_response,
        auto_ack = True,
    )

    channel.basic_publish(
        exchange='',
        routing_key=queue_name,
        properties=pika.BasicProperties(
            reply_to=callback_queue,
            correlation_id=correlation_id
            ),
        body=json.dumps(message),
    )

    start_time = time.time()
    while response is None or time.time() - start_time < 5:
        connection.process_data_events()
    if response is None:
        print("Timeout occurred, no response received.")
        channel.stop_consuming()
        connection.close()
        return None
    connection.close()
    if response.get('status') == 'error':
        return None
    return response

