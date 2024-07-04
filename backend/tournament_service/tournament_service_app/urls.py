from django.urls import path
from .controllers.tournament_controller import next_match, find_tournament, create_tournament, add_participants, start_tournament

urlpatterns = [
	# criar rota de criacao de torneio
	# criar rota de adicionar player ao torneio
	# path('/', start_tournament, name='start_tournament'),
	path('create/', create_tournament, name='create_tournament'),
    path('<uuid:id>/', find_tournament, name='find_tournament'),
	path('participants/<uuid:id>/', add_participants, name='add_participant'),
    path('start_tournament/<uuid:id>/', start_tournament, name='start_tournament'),
    path('next_match/<uuid:id>/', next_match, name='next_match')
]
