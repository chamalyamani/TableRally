from django.urls import re_path
from . import consumers

tic_websocket_patterns = [
    re_path(r"ws/play/", consumers.test.as_asgi()),
]