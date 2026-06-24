from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Caso, Perfil
from .serializers import (
    CasoSerializer, CasoCreateSerializer, CasoUpdateSerializer,
    CasoEstadoSerializer, CasoPreguntasSerializer, CasoRespuestasSerializer,
    CasoGPSSerializer, PerfilSerializer, PerfilCreateSerializer,
)


def calcular_comisaria(ubicacion):
    if not ubicacion:
        return '48° Comisaría (por defecto)'
    u = ubicacion.lower()
    if 'providencia' in u or 'santiago' in u:
        return '48° Comisaría · Av. Providencia 123'
    if 'ñuño' in u:
        return '14° Comisaría · Av. Irarrázaval 2500'
    if 'la florida' in u:
        return '47° Comisaría · Av. Vicuña Mackenna 7000'
    if 'maipú' in u:
        return '52° Comisaría · Av. 5 de Abril 1500'
    if 'las condes' in u or 'vitacura' in u:
        return '12° Comisaría · Av. Las Condes 8500'
    if 'independencia' in u or 'recoleta' in u:
        return '3° Comisaría · Av. Independencia 700'
    return '48° Comisaría (cercanía estimada)'


@api_view(['POST'])
def register_view(request):
    serializer = PerfilCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    if Perfil.objects.filter(rut=data['rut']).exists():
        return Response({
            'success': False,
            'blocked': True,
            'blocked_reason': 'Ya registrado. Contacta a un operador.',
        }, status=status.HTTP_400_BAD_REQUEST)

    perfil = Perfil.objects.create(
        rut=data['rut'],
        num_documento=data.get('num_documento', ''),
        nombre=data['nombre'],
        telefono=data.get('telefono', ''),
        direccion=data.get('direccion', ''),
        contacto_nombre=data.get('contacto_nombre', ''),
        contacto_telefono=data.get('contacto_telefono', ''),
        blocked=False,
        blocked_reason='',
    )
    return Response({
        'success': True,
        'perfil': PerfilSerializer(perfil).data,
    }, status=status.HTTP_201_CREATED)


class CasoViewSet(viewsets.ModelViewSet):
    queryset = Caso.objects.all()
    serializer_class = CasoSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return CasoCreateSerializer
        if self.action in ['update', 'partial_update']:
            return CasoUpdateSerializer
        return CasoSerializer

    def create(self, request, *args, **kwargs):
        serializer = CasoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        ubicacion = data.get('contexto', {}).get('ubicacion', '')
        comisaria = calcular_comisaria(ubicacion)

        caso = Caso.objects.create(
            victim_rut=data.get('victimRut', ''),
            victim_nombre=data.get('victimNombre', ''),
            victim_telefono=data.get('victimTelefono', ''),
            victim_contacto_nombre=data.get('victimContactoNombre', ''),
            victim_contacto_telefono=data.get('victimContactoTelefono', ''),
            emergencia=data.get('emergencia'),
            contexto=data.get('contexto', {}),
            lat=data.get('lat'),
            lng=data.get('lng'),
            gps_timestamp=timezone.now() if data.get('lat') else None,
            gps_last_updated=timezone.now() if data.get('lat') else None,
            estado='asignada',
            comisaria_cercana=comisaria,
            asignados=['Sargento Munoz', 'Cabo Perez'],
            servicios_externos=[
                {'servicio': 'Ambulancia 131', 'contactado': False},
                {'servicio': 'Bomberos 132', 'contactado': False},
            ],
        )

        return Response(
            CasoSerializer(caso).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = CasoUpdateSerializer(data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        for attr, value in data.items():
            if attr in ['lat', 'lng'] and value is not None:
                setattr(instance, attr, value)
                instance.gps_timestamp = timezone.now()
                instance.gps_last_updated = timezone.now()
            else:
                setattr(instance, attr, value)
        instance.save()

        return Response(CasoSerializer(instance).data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=['put'], url_path='estado')
    def cambiar_estado(self, request, pk=None):
        caso = self.get_object()
        serializer = CasoEstadoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        caso.estado = serializer.validated_data['estado']
        caso.save()
        return Response(CasoSerializer(caso).data)

    @action(detail=True, methods=['post'], url_path='gps')
    def actualizar_gps(self, request, pk=None):
        caso = self.get_object()
        serializer = CasoGPSSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        caso.lat = serializer.validated_data['lat']
        caso.lng = serializer.validated_data['lng']
        caso.gps_timestamp = timezone.now()
        caso.gps_last_updated = timezone.now()
        caso.save()
        return Response(CasoSerializer(caso).data)

    @action(detail=True, methods=['post'], url_path='preguntas')
    def enviar_preguntas(self, request, pk=None):
        caso = self.get_object()
        serializer = CasoPreguntasSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nuevas = serializer.validated_data['preguntas']
        existentes = set(caso.preguntas_terreno_pendientes or [])
        caso.preguntas_terreno_pendientes = list(existentes.union(set(nuevas)))
        if caso.estado == 'asignada':
            caso.estado = 'en_terreno'
        caso.save()
        return Response(CasoSerializer(caso).data)

    @action(detail=True, methods=['post'], url_path='responder')
    def responder_preguntas(self, request, pk=None):
        caso = self.get_object()
        serializer = CasoRespuestasSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        respuestas = serializer.validated_data['respuestas']
        caso.respuestas_terreno.update(respuestas)
        caso.preguntas_terreno_pendientes = []
        caso.save()
        return Response(CasoSerializer(caso).data)

    @action(detail=False, methods=['get'], url_path='rut/(?P<rut>[^/]+)')
    def por_rut(self, request, rut=None):
        casos = Caso.objects.filter(victim_rut=rut)
        return Response(CasoSerializer(casos, many=True).data)


class PerfilViewSet(viewsets.ModelViewSet):
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer
    lookup_field = 'rut'

    def get_lookup_regex(self):
        return r'[^/]+'

    def get_object(self):
        rut = self.kwargs.get('rut')
        obj, created = Perfil.objects.get_or_create(rut=rut)
        return obj


@api_view(['GET'])
def listar_carabineros(request):
    carabineros = [
        {'id': 1, 'nombre': 'Sargento Muñoz', 'unidad': '48° Comisaría'},
        {'id': 2, 'nombre': 'Cabo Pérez', 'unidad': '48° Comisaría'},
        {'id': 3, 'nombre': 'Teniente Soto', 'unidad': '48° Comisaría'},
        {'id': 4, 'nombre': 'Suboficial Rojas', 'unidad': '14° Comisaría'},
        {'id': 5, 'nombre': 'Carabinero Morales', 'unidad': '14° Comisaría'},
    ]
    return Response(carabineros)
