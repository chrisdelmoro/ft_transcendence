from django.apps import AppConfig
import sys
import threading

class TournamentServiceAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tournament_service_app'
    def ready(self):
        if 'runserver' in sys.argv or 'gunicorn' in sys.argv:
            from .services.tournament_consumer import start_consumer
            # Iniciar o consumidor RabbitMQ em uma nova thread
            consumer_thread = threading.Thread(target=start_consumer)
            consumer_thread.daemon = True  # Permite que o Django pare mesmo que esta thread esteja ativa
            consumer_thread.start()


