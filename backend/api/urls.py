from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CasoViewSet, PerfilViewSet, listar_carabineros,
    register_view,
)

router = DefaultRouter()
router.register(r'casos', CasoViewSet)
router.register(r'perfil', PerfilViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_view, name='register'),
    path('carabineros/', listar_carabineros, name='carabineros'),
]
