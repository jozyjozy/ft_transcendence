from django.urls import path
from .views import game, roomview, room_pong, game_local, game_localAi, game_tournement
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('game/', game, name='Pong'),
    path('game_local/<str:username>', game_local, name='Pong_local'),
    path('game_localAi/<str:username>', game_localAi, name='Pong_localAi'),
    path("rooms/<uuid:uuid>/", roomview, name="group"),
	path('GameRoom/', room_pong, name='GameRoom_page'),
    path('Tournement/<str:username>', game_tournement, name='game_tournement')
] + static(settings.ASSETS_URL, document_root=settings.ASSETS_ROOT)
