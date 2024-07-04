from django.urls import path
from .controllers.auth_controller import login, verify_jwt_token, oauth_callback, verify_2fa, login_2fa

urlpatterns = [
	path('login/', login, name='login'),
    path('authorized/', verify_jwt_token, name='authorized'),
	path('oauth2/authorize/', oauth_callback, name='oauth2_authorize'),
    path('verify_2fa/', verify_2fa, name='verify_2fa'),
    path('login/code/', login_2fa, name='verify_2fa')
]
