from django.urls import re_path, path

from . import consumers

websocket_urlpatterns = [
    path('game/', consumers.JoinGame.as_asgi()),
    path('game_local/<str:username>',consumers.PongLocalConsumer.as_asgi()),
    path('Tournement/<str:username>',consumers.PongLocalConsumer.as_asgi()),
    path('game_localAi/<str:username>',consumers.PongLocalAiConsumer.as_asgi()),
    path('rooms/<uuid:uuid>/',consumers.PongConsumer.as_asgi())
]
