from django.contrib import admin
from django.urls import path, include

urlpatterns = [
	path('game/', include('game_service_app.urls')),
	path('', include('django_prometheus.urls')),
]
