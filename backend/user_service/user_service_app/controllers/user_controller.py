
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from user_service_app.services.user_service import UserService
from ..models.user import User
from ..utils.jwt import get_payload
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import traceback
import uuid
import re
class UserController:
    @staticmethod
    @csrf_exempt
    def upload(request):
        if request.method != 'POST':
            return JsonResponse({'message': 'Method not allowed'}, status=405)
        try:
            if request.FILES.get('profile_picture') is None:
                return JsonResponse({'message': 'No file found'}, status=404)
            profile_picture = request.FILES.get('profile_picture')
            name = str(uuid.uuid4()) + "_" + profile_picture.name

            control_and_whitespace_chars = re.compile(r'[\x00-\x1F\x7F\s]')
            name = control_and_whitespace_chars.sub('', name)

            file_name = os.path.join("imgs",  name)
            file_path = default_storage.save(file_name, ContentFile(profile_picture.read()))
            user_id = get_payload(request, 'user')
            user = User.objects.get(user_id=user_id)
            if user.profile_picture != None and user.profile_picture.startswith(os.getenv("URL_UPLOAD")):
                default_storage.delete(os.path.join("imgs", user.profile_picture.replace(os.getenv("URL_UPLOAD"), '')))
            user.profile_picture = os.getenv("URL_UPLOAD") + name
            user.save()
            return JsonResponse({'profile_picture': user.profile_picture}, status=200)
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({'message': str(e)}, status=500)


    @staticmethod
    @csrf_exempt
    def register_user( request):
        if request.method == 'POST':
            data = json.loads(request.body.decode('utf-8'))
            res = UserService().create_user(data['email'], data['username'], data['password'])
            return res
        else :
            return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    @csrf_exempt
    def get_user(request):
        if request.method == 'GET':
            id = get_payload(request, 'user')
            return UserService().get_user(id)
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    @csrf_exempt
    def findByid(request, id):
        if request.method == 'GET':
            return UserService().get_user(id)
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    @csrf_exempt
    def get_all_user(request):
        if request.method == 'GET':
            return UserService().get_all_users()
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    @csrf_exempt
    def update_user(request):
        if request.method == 'PUT':
            data = json.loads(request.body.decode('utf-8'))
            user_id = get_payload(request, 'user')
            return UserService().update_user(user_id, data)
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    @csrf_exempt
    def delete_user(request, id):
        if request.method == 'DELETE':
            return UserService().delete_user(id)
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    @csrf_exempt
    def online(request):
        if request.method == 'PUT':
            id = get_payload(request, 'user')
            try :
                user = User.objects.get(user_id=id)
                user.status = 'online'
                user.save()
                return JsonResponse({'message': 'User is now online'}, status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User not found'}, status=404) 
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)
        
    @staticmethod
    @csrf_exempt
    def offline(request):
        if request.method == 'PUT':
            id = get_payload(request, 'user')
            try :
                user = User.objects.get(user_id=id)
                user.status = 'offline'
                user.save()
                return JsonResponse({'message': 'User is now offline '}, status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User not found'}, status=404) 
        else:
            return JsonResponse({'message': 'Method not allowed'}, status=405)