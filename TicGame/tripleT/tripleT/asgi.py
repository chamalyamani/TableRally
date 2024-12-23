import os

from django.core.asgi import get_asgi_application
from django.urls import re_path
from tic_tac_toe.consumers import test
from channels.routing import ProtocolTypeRouter, URLRouter
from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler
from channels.security.websocket import AllowedHostsOriginValidator
from tic_tac_toe.routing import tic_websocket_patterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tripleT.settings')

# application = get_asgi_application()


application = ProtocolTypeRouter({
    "http" : get_asgi_application(),
    "websocket" : URLRouter(
        tic_websocket_patterns
    )
})
