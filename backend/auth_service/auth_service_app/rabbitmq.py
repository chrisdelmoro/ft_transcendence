import pika
import os

rabbitmq_host = os.getenv('RABBITMQ_HOST', 'rabbitmq')
rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
rabbitmq_pass = os.getenv('RABBITMQ_PASS', 'guest')
credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_pass)
parameters = pika.ConnectionParameters(rabbitmq_host, 5672, '/', credentials, heartbeat=60, blocked_connection_timeout=300)
def create_connection():
    try :
        print(f"Connecting to RabbitMQ at {rabbitmq_host}")
        connection = pika.BlockingConnection(parameters=parameters)
        channel = connection.channel()
        return connection, channel
    except Exception as e:
        print(f"Error while trying to connect to RabbitMQ: {e}") 
        return create_connection()