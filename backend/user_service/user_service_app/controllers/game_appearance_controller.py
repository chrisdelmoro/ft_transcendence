import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models.game_appearance import GameAppearance
from ..models.user import User
from django.forms.models import model_to_dict

class GameAppearanceController:

    @staticmethod
    @csrf_exempt
    def update_appearance(request, id):
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                user = User.objects.get(user_id=id)
                appearance, created = GameAppearance.objects.get_or_create(user_id=user)
                appearance.theme = data.get('theme', appearance.theme)
                appearance.paddle_color = data.get('paddle_color', appearance.paddle_color)
                appearance.ball_color = data.get('ball_color', appearance.ball_color)
                appearance.background_color = data.get('background_color', appearance.background_color)
                appearance.save()

                return JsonResponse(model_to_dict(appearance), status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User not found'}, status=404)
            except Exception as e:
                return JsonResponse({'message': str(e)}, status=400)
        return JsonResponse({'message': 'Method not allowed'}, status=405)

    @staticmethod
    def get_appearance(request, id):
        if request.method == 'GET':
            try:
                user = User.objects.get(user_id=id)
                appearance = GameAppearance.objects.get(user_id=user)
                return JsonResponse(model_to_dict(appearance), status=200)
            except User.DoesNotExist:
                return JsonResponse({'message': 'User not found'}, status=404)
            except GameAppearance.DoesNotExist:
                return JsonResponse({'message': 'Game appearance not found'}, status=404)
            except Exception as e:
                return JsonResponse({'message': str(e)}, status=400)
        return JsonResponse({'message': 'Method not allowed'}, status=405)
