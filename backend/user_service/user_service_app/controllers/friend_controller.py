import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from user_service_app.services.user_service import User
from ..models.user import User
from ..models.user_friends import UserFriends
from ..utils import jwt
from django.forms.models import model_to_dict

class FriendController:
# Lista todos os amigos de um usuário
    @staticmethod
    @csrf_exempt
    def list_friends(request, id):
        if (request.method != 'GET'):
            return JsonResponse({'message': 'Method not allowed'}, status=405)
        try:
            user = User.objects.get(user_id=id)
            accepted_friends_request = UserFriends.objects.filter(user=user, status='accepted').values()
            accepted_friends_recived = UserFriends.objects.filter(friend=user, status='accepted').values()
            accepted_friends = list(accepted_friends_request) + list(accepted_friends_recived)
            pending_friends = UserFriends.objects.filter(status='pending', friend=user).values()
            for friend in accepted_friends:
                if friend['user_id'] == id:
                    friend['friend'] = model_to_dict(User.objects.get(user_id=friend['friend_id']), exclude={"otp_secret", "password"})
                else:
                    friend['friend'] = model_to_dict(User.objects.get(user_id=friend['user_id']), exclude={"otp_secret", "password"})
            for friend in pending_friends:
                if friend['user_id'] == id:
                    friend['friend'] = model_to_dict(User.objects.get(user_id=friend['friend_id']), exclude={"otp_secret", "password"})
                else:
                    friend['friend'] = model_to_dict(User.objects.get(user_id=friend['user_id']), exclude={"otp_secret", "password"}) 
            friends_data = {
                'accepted': list(accepted_friends),
                'pending': list(pending_friends)
            }

            return JsonResponse(friends_data, safe=False, status=200)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)

    # Adiciona um amigo ao usuário
    @staticmethod
    @csrf_exempt
    def add_friend(request, id):
        if request.method == 'POST':
            try:
                body = json.loads(request.body.decode('utf-8'))
                friend_id = body.get('friend_id')
                if (id == friend_id):
                    return JsonResponse({'message': 'You can not add yourself as a friend'}, status=400)
                user = User.objects.get(user_id=id)
                friend = User.objects.get(user_id=friend_id)
                # Verificar se já existe uma solicitação pendente ou aceita
                existing_friendship = UserFriends.objects.filter(user=user, friend=friend).first()
                if existing_friendship:
                    return JsonResponse({'message': 'Friend request already sent or friendship already exists'}, status=400)

                UserFriends.objects.create(user=user, friend=friend, status='pending')
                return JsonResponse({'message': 'Friend request sent successfully'}, status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User or Friend not found'}, status=404)
            except Exception as e:
                return JsonResponse({'message': str(e)}, status=400)
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    @csrf_exempt
    def accept_friend(request, id):
        if request.method == 'POST':
            try:
                body = json.loads(request.body.decode('utf-8'))
                friend_id = body.get('friend_id')
                friend = User.objects.get(user_id=friend_id)
                friendship = UserFriends.objects.get(user=friend, id=id, status='pending')
                friendship.status = 'accepted'
                friendship.save()
                return JsonResponse({'message': 'Friend request accepted successfully'}, status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User or Friend not found'}, status=404)
            except UserFriends.DoesNotExist:
                return JsonResponse({'message': 'Friend request not found'}, status=404)
            except Exception as e:
                return JsonResponse({'message': str(e)}, status=400)
        return JsonResponse({'message': 'Invalid request method'}, status=405)

    # Remove um amigo do usuário
    @staticmethod
    @csrf_exempt
    def remove_friend(request, id):
        if request.method == 'DELETE':
            try:
                user_id = jwt.get_payload(request, 'user')  
                user = User.objects.get(user_id=user_id)
                friends = UserFriends.objects.filter(id=id, user_id=user)
                friends = list(friends) + list(UserFriends.objects.filter(id=id, friend=user))
                for friend in friends:
                    friend.delete()
                return JsonResponse({'message': 'Friend removed successfully'}, status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User or Friend not found'}, status=404)
            except Exception as e:
                print(str(e))
                return JsonResponse({'message': str(e)}, status=400)
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)


    # Procura usuários pelo nome
    @staticmethod
    @csrf_exempt
    def search_user(request):
        if request.method == 'GET':
            query = request.GET.get('query', '')
            try:
                user_id = jwt.get_payload(request, 'user')
                users = User.objects.filter(username__icontains=query)
                users_data = []
                for user in users:
                    if str(user.user_id) == user_id:
                        continue
                    if UserFriends.objects.filter(user=user, friend_id=user_id).exists():
                        continue
                    if UserFriends.objects.filter(friend=user, user_id=user_id).exists():
                        continue
                    user_dict = model_to_dict(user, exclude={"otp_secret", "password"})
                    user_dict['user_id'] = str(user.user_id)
                    users_data.append(user_dict)
                return JsonResponse(users_data, safe=False, status=200)
            except Exception as e:
                return JsonResponse({'message': str(e)}, status=400)
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)
