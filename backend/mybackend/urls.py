from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views import (
    EquipmentViewSet,
    EquipmentHistoryViewSet,
    CustomUserViewSet,
    EstoqueViewSet,
    LogEquipamentoViewSet,
    GroupViewSet,
    get_profile
)

router = routers.DefaultRouter()
router.register(r'equipments', EquipmentViewSet)
router.register(r'equipment-history', EquipmentHistoryViewSet)
router.register(r'users', CustomUserViewSet)
router.register(r'estoques', EstoqueViewSet, basename='estoques')
router.register(r'logs', LogEquipamentoViewSet, basename='logs')
router.register(r'groups', GroupViewSet, basename='groups')

urlpatterns = [
    path('', include(router.urls)),  # Adiciona a rota /logs/
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', get_profile, name='profile'),
]
