from django.urls import path
from user_service_app.controllers.user_controller import UserController
from user_service_app.controllers.friend_controller import FriendController
from user_service_app.controllers.game_appearance_controller import GameAppearanceController
from .controllers.two_fa_controller import qr_generator

urlpatterns = [
    path('create/', UserController().register_user, name='get_user'),
    path('update/', UserController().update_user, name='update_user'),
    path('delete/<uuid:id>/', UserController().delete_user, name='delete_user'),
    path('findById/', UserController().get_user, name='get_user_s'),
    path('findById/<uuid:id>/', UserController().findByid, name='find_user'),
    path('get_all_users/', UserController().get_all_user, name='get_all_users'),
    path('2fa_qrcode/', qr_generator, name='qr_generator'),
    path('list_friends/<uuid:id>/', FriendController().list_friends, name='list_friend'),
    path('add_friend/<uuid:id>/', FriendController().add_friend, name='add_friend'),
	path('accept_friend/<uuid:id>/', FriendController.accept_friend, name='accept_friend'),
    path('remove_friend/<uuid:id>/', FriendController().remove_friend, name='remove_friend'),
    path('search_user/', FriendController().search_user, name='search_user'),
    path('update_appearance/<uuid:id>/', GameAppearanceController.update_appearance, name='update_appearance'),
    path('get_appearance/<uuid:id>/', GameAppearanceController.get_appearance, name='get_appearance'),
    path('online/', UserController().online, name='online'),
    path('upload/', UserController.upload, name='upload_profile_picture'),
    path('offline/', UserController().offline, name='offline'),
]

