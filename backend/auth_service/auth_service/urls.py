from django.urls import path, include

urlpatterns = [
    path('auth/', include('auth_service_app.urls')),
	path('', include('django_prometheus.urls')),
]
