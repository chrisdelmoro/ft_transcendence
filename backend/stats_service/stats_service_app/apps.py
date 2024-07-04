from django.apps import AppConfig
import sys
import threading
from .service.consumer import consumer

class StatsServiceAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stats_service_app'
    def ready(self):
        if 'runserver' in sys.argv or 'gunicorn' in sys.argv:
            # Iniciar o consumidor RabbitMQ em uma nova thread
            consumer_thread = threading.Thread(target=consumer)
            consumer_thread.daemon = True  # Permite que o Django pare mesmo que esta thread esteja ativa
            consumer_thread.start()