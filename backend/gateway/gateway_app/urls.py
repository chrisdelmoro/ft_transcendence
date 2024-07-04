from django.urls import path
from .views import ProxyView

urlpatterns = [
    path('<path:path>', ProxyView.as_view(), name='proxy'),
]
