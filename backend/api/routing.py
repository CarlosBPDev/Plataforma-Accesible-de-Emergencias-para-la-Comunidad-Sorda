from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/casos/(?P<caso_id>[^/]+)/gps/$', consumers.GPSConsumer.as_asgi()),
    re_path(r'ws/casos/(?P<caso_id>[^/]+)/$', consumers.CasoConsumer.as_asgi()),
]
