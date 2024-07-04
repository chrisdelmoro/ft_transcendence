from django.urls import path, include

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('', include('django_prometheus.urls')),
    path('user/', include('user_service_app.urls')),
]+ static( settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)
