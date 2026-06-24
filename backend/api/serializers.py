from rest_framework import serializers
from .models import Caso, Perfil


class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = '__all__'


class PerfilCreateSerializer(serializers.Serializer):
    rut = serializers.CharField(max_length=20)
    num_documento = serializers.CharField(max_length=20, required=False, default='')
    nombre = serializers.CharField(max_length=100)
    telefono = serializers.CharField(max_length=20, required=False, default='')
    direccion = serializers.CharField(required=False, default='')
    contacto_nombre = serializers.CharField(required=False, default='')
    contacto_telefono = serializers.CharField(required=False, default='')


class CasoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Caso
        fields = '__all__'


class CasoCreateSerializer(serializers.Serializer):
    victimRut = serializers.CharField(max_length=20, required=False, default='')
    victimNombre = serializers.CharField(max_length=100, required=False, default='')
    victimTelefono = serializers.CharField(max_length=20, required=False, default='')
    victimContactoNombre = serializers.CharField(max_length=100, required=False, default='')
    victimContactoTelefono = serializers.CharField(max_length=20, required=False, default='')
    emergencia = serializers.JSONField(required=False, allow_null=True)
    contexto = serializers.JSONField(required=False, default=dict)
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)

    def validate_contexto(self, value):
        if not isinstance(value, dict):
            return {'ubicacion': '', 'respuestas': {}, 'preguntas': {}}
        return value


class CasoUpdateSerializer(serializers.Serializer):
    emergencia = serializers.JSONField(required=False)
    contexto = serializers.JSONField(required=False)
    estado = serializers.ChoiceField(choices=Caso.ESTADO_CHOICES, required=False)
    asignados = serializers.JSONField(required=False)
    lat = serializers.FloatField(required=False, allow_null=True)
    lng = serializers.FloatField(required=False, allow_null=True)


class CasoEstadoSerializer(serializers.Serializer):
    estado = serializers.ChoiceField(choices=Caso.ESTADO_CHOICES)


class CasoPreguntasSerializer(serializers.Serializer):
    preguntas = serializers.ListField(child=serializers.IntegerField())


class CasoRespuestasSerializer(serializers.Serializer):
    respuestas = serializers.JSONField()


class CasoGPSSerializer(serializers.Serializer):
    lat = serializers.FloatField()
    lng = serializers.FloatField()
