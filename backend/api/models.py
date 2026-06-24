import uuid
from django.db import models


class Perfil(models.Model):
    rut = models.CharField(max_length=20, unique=True)
    num_documento = models.CharField(max_length=20, blank=True, default='')
    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, default='')
    direccion = models.TextField(blank=True, default='')
    contacto_nombre = models.CharField(max_length=100, blank=True, default='')
    contacto_telefono = models.CharField(max_length=20, blank=True, default='')
    blocked = models.BooleanField(default=False)
    blocked_reason = models.TextField(blank=True, default='')
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-creado_en']

    def __str__(self):
        return f"{self.nombre} ({self.rut})"


class Caso(models.Model):
    ESTADO_CHOICES = [
        ('recibida', 'Recibida'),
        ('aceptada', 'Aceptada'),
        ('asignada', 'Asignada'),
        ('en_terreno', 'En Terreno'),
        ('completada', 'Completada'),
    ]

    CONTACTO_ESTADO_CHOICES = [
        ('contactado', 'Contactado'),
        ('sin_respuesta', 'Sin Respuesta'),
    ]

    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)
    victim_rut = models.CharField(max_length=20, blank=True, default='')
    victim_nombre = models.CharField(max_length=100, blank=True, default='')
    victim_telefono = models.CharField(max_length=20, blank=True, default='')
    victim_contacto_nombre = models.CharField(max_length=100, blank=True, default='')
    victim_contacto_telefono = models.CharField(max_length=20, blank=True, default='')
    contacto_estado = models.CharField(max_length=20, choices=CONTACTO_ESTADO_CHOICES, null=True, blank=True)
    contacto_notas = models.TextField(blank=True, default='')
    emergencia = models.JSONField(null=True, blank=True)
    contexto = models.JSONField(default=dict, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='recibida')
    asignados = models.JSONField(default=list, blank=True)
    comisaria_cercana = models.CharField(max_length=200, blank=True, default='')
    servicios_externos = models.JSONField(default=list, blank=True)
    nota_operador = models.TextField(blank=True, default='')
    preguntas_terreno_pendientes = models.JSONField(default=list, blank=True)
    respuestas_terreno = models.JSONField(default=dict, blank=True)
    ubicacion_carabinero = models.JSONField(default=dict, blank=True)
    tiempo_estimado_llegada = models.IntegerField(null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)
    gps_timestamp = models.DateTimeField(null=True, blank=True)
    gps_last_updated = models.DateTimeField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)
    acta = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-creado_en']

    def __str__(self):
        return f"Caso {self.id} - {self.victim_nombre} ({self.estado})"
