from django.http import JsonResponse
from django.contrib.auth.hashers import make_password
from user_service_app.models.user import User
from django.contrib.auth.hashers import check_password
from user_service_app.models.player_stats import PlayerStats
from user_service_app.models.game_appearance import GameAppearance
from django.forms.models import model_to_dict
import json


class UserService:
    def create_user(self, email, username, password):
        # Verifica se o usuário já existe pelo username
        if User.objects.filter(username=username).exists():
            return JsonResponse({'message': 'User already exists'}, status=409)

        # Verifica se o usuário já existe pelo email
        if User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Email already exists'}, status=409)

        # Cria o novo usuário com hashing de senha
        user = User.objects.create(username=username, email=email, password=make_password(password), status='offline')
        PlayerStats.objects.create(user_id=user)
        GameAppearance.objects.create(user_id=user)
        return JsonResponse(model_to_dict(user, exclude={"otp_secret", "password"}), status=201)

    def get_user(self, user_id):
        try:
            user = User.objects.get(user_id=user_id)
            stats = PlayerStats.objects.filter(user_id=user_id).values()
            appearance = GameAppearance.objects.filter(user_id=user_id).values()

            user_data = model_to_dict(user, exclude={"otp_secret", "password"})
            user_data['user_id'] = user_id
            user_data['stats'] = list(stats)
            user_data['appearance'] = list(appearance)

            return JsonResponse(user_data, status=200)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    def get_all_users(self):
        users = User.objects.all().values()
        return JsonResponse(list(users), status=200, safe=False)

    def update_user(self, user_id, user_data):
        try:
            user = User.objects.get(user_id=user_id)
            if 'username' in user_data:
                if User.objects.filter(username=user_data.get('username')).first() != None:
                    return JsonResponse({'message': 'Username already exists'}, status=409)
            user.username = user_data.get('username', user.username)
            password = user_data.get('password') 
            newPass = user_data.get('new_password')
            print(check_password(password, user.password), password, newPass)
            if password != None and newPass != None and check_password(password, user.password):
                user.password = make_password(newPass)
            user.save()
            return JsonResponse(model_to_dict(user, exclude={"otp_secret", "password"}), status=200)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    def delete_user(self, user_id):
        try:
            user = User.objects.get(user_id=user_id)
            user.delete()
            return JsonResponse({'message': 'User deleted'})
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)
