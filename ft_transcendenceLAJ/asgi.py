import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ft_transcendenceLAJ.settings')

asgi_application = get_asgi_application()

import LAJchat.routing
import game.routing

websocket_urlpatterns = LAJchat.routing.websocket_urlpatterns + game.routing.websocket_urlpatterns
application = ProtocolTypeRouter({
    "http": asgi_application,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
