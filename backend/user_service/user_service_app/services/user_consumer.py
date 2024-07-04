import json
import pika
import uuid
from django.contrib.auth.hashers import make_password
from django.contrib.auth.hashers import check_password
from ..utils.qr_code_otp import verify_otp
from django.forms.models import model_to_dict
import time
from ..rabbitmq import create_connection
from ..models.user import User
from ..models.game_appearance import GameAppearance
from ..models.player_stats import PlayerStats
from .stats_service import endGameUpdate, tournnament_won , tournnament_played
USER_STATS_QUEUE = 'USER_STATS_QUEUE'


def handle_authenticate(credentials):
    username = credentials.get('username')
    password = credentials.get('password')
    try:
        user = User.objects.filter(username=username).values('user_id', 'username', 'email', 'is_auth', 'status', 'password').first()
        if check_password(password, user.get('password')):
            user['password'] = None
            user['user_id'] = str(user['user_id'])
            response = {'valid': True, 'user': user}
        else:
            response = {'valid': False, 'user': {}}
    except Exception as e:
        response = {'valid': False, 'user': {}, 'error': str(e)}
    return response

# Função para autenticar ou registrar usuário pela API 42
def handle_authenticate_or_register(user_info):
    email = user_info.get('email')
    username = user_info.get('login')
    print( "email: ", email, "username: ", username)
    try:
        user = User.objects.filter(email=email).first()
        if user:
            res = model_to_dict(user, exclude={"otp_secret", "password"})
            res["user_id"] = str(user.user_id)
            response = {'valid': True, 'user': res}
        else:
            user = User.objects.create(
                username=username,
                email=email,
                password=make_password(str(uuid.uuid4())),
                status='online')
            GameAppearance.objects.create(user_id=user)
            PlayerStats.objects.create(user_id=user)
            res = model_to_dict(user, exclude={"otp_secret", "password"})
            res["user_id"] = str(user.user_id)
            response = {'valid': True, 'user': res}
    except Exception as e:
        response = {'valid': False, 'user': {}, 'error': str(e)}
    
    return response

def handle_authenticate_2fa(data, isID):
    user_id = data.get('user_id')
    token = data.get('token')

    try:
        if (isID):
            user = User.objects.get(user_id=user_id)
        else:
            user = User.objects.get(email=user_id)
        
        if user.otp_secret and isID:
            # Verifica o token 2FA
            if verify_otp(user.otp_secret, token):
                user.is_auth = not user.is_auth 
                user.save()
                res = model_to_dict(user, exclude={"otp_secret", "password"})
                res["user_id"] = str(user.user_id)
                return {'valid': True, 'user': res}
        elif user.otp_secret and user.is_auth == True and isID == False:
            if verify_otp(user.otp_secret, token):
                res = model_to_dict(user, exclude={"otp_secret", "password"})
                res["user_id"] = str(user.user_id)
                return {'valid': True, 'user': res}
        return {'valid': False, 'user': {}}
    except Exception as e:
        return{'valid': False, 'user': {}, 'error': str(e)}


def on_request(ch, method, props, body):
    data = json.loads(body)
    action = data.get('action')
    response = {}

    print("action: ", action)
        # Diferencia entre os tipos de ação
    if action == 'authenticate':
        response = handle_authenticate(data)
    elif action == 'authenticate_or_register':
        response = handle_authenticate_or_register(data)
    elif action == 'verify_2fa_secret':
        response = handle_authenticate_2fa(data, True)
    elif action == 'login_2fa':
        response = handle_authenticate_2fa(data, False)
    else:
        response = {'valid': False, 'user': {}}


    # Envia a resposta de volta para o `auth_service`
    ch.basic_publish(
        exchange='',
        routing_key=props.reply_to,
        properties=pika.BasicProperties(correlation_id=props.correlation_id),
        body=json.dumps(response)
    )
    ch.basic_ack(delivery_tag=method.delivery_tag)

def on_request_stats(ch, method, props, body):
    data = json.loads(body)

    print(f"[Received message from {USER_STATS_QUEUE}][action: {data.get('action')}][data: {data}]")
    if data.get('action') == 'update_game_played':
        endGameUpdate(data)
    elif data.get('action') == 'update_tournament_played':
        tournnament_played(data)
    elif data.get('action') == 'update_tournament_winner':
        tournnament_won(data)
    else :
        print("Invalid message received, for update game played")
    ch.basic_ack(delivery_tag=method.delivery_tag)


def start_consumer():
    while True:
        try:
            _, channel = create_connection()
            channel.basic_qos(prefetch_count=1)
            channel.queue_declare(queue='AUTH_USER')
            channel.basic_consume(queue='AUTH_USER', on_message_callback=on_request)
            channel.queue_declare(queue=USER_STATS_QUEUE)
            channel.basic_consume(queue=USER_STATS_QUEUE, on_message_callback=on_request_stats)
            print(" [x] Awaiting RPC requests")
            channel.start_consuming()
        except pika.exceptions.ConnectionClosedByBroker as e:
            time.sleep(20)
        except pika.exceptions.AMQPConnectionError as e:
            time.sleep(20)
        except Exception as e:
            time.sleep(20)


if __name__ == '__main__':
    start_consumer()
