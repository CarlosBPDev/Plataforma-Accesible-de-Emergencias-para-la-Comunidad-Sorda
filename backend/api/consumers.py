import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class GPSConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.caso_id = self.scope['url_route']['kwargs']['caso_id']
        self.room_group_name = f'caso_{self.caso_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        lat = data.get('lat')
        lng = data.get('lng')

        if lat is not None and lng is not None:
            await self.actualizar_gps_caso(lat, lng)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'gps_update',
                    'lat': lat,
                    'lng': lng,
                    'timestamp': timezone.now().isoformat(),
                }
            )

    async def gps_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'gps_update',
            'lat': event['lat'],
            'lng': event['lng'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def actualizar_gps_caso(self, lat, lng):
        from api.models import Caso
        Caso.objects.filter(pk=self.caso_id).update(
            lat=lat,
            lng=lng,
            gps_timestamp=timezone.now(),
            gps_last_updated=timezone.now(),
            actualizado_en=timezone.now()
        )


class CasoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.caso_id = self.scope['url_route']['kwargs']['caso_id']
        self.room_group_name = f'caso_{self.caso_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type')

        if event_type == 'pregunta':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'pregunta_update',
                    'pregunta_id': data.get('pregunta_id'),
                    'pregunta_texto': data.get('pregunta_texto'),
                    'opciones': data.get('opciones', []),
                }
            )
        elif event_type == 'respuesta':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'respuesta_update',
                    'pregunta_id': data.get('pregunta_id'),
                    'respuesta': data.get('respuesta'),
                }
            )
        elif event_type == 'estado_update':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'estado_update',
                    'estado': data.get('estado'),
                }
            )

    async def pregunta_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'pregunta',
            'pregunta_id': event['pregunta_id'],
            'pregunta_texto': event['pregunta_texto'],
            'opciones': event['opciones'],
        }))

    async def respuesta_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'respuesta',
            'pregunta_id': event['pregunta_id'],
            'respuesta': event['respuesta'],
        }))

    async def estado_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'estado',
            'estado': event['estado'],
        }))
