from django.db import IntegrityError
from django.contrib.auth.models import Group
from rest_framework import viewsets, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Equipment, EquipmentHistory, CustomUser, Estoque, LogEquipamento
from .serializers import (
    EquipmentSerializer, 
    EquipmentHistorySerializer, 
    CustomUserSerializer,
    EstoqueSerializer,
    LogEquipamentoSerializer,
    GroupSerializer
)
# Importa as permissões customizadas
from .permissions import EquipmentPermission, EstoquePermission, CustomUserPermission

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated, EquipmentPermission]

    def get_queryset(self):
        qs = super().get_queryset().order_by("-id")  # Ordena pelo ID de forma decrescente
        estoque_param = self.request.query_params.get('estoque')
        if estoque_param:
            qs = qs.filter(estoque=estoque_param)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError:
            return Response(
                {"error": "Tombamento ou SerialNumber já cadastrado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        equipment = self.get_object()
        old_stock = equipment.estoque_id  # Armazena o estoque anterior
        
        # Copia dos dados enviados para não alterar a request original
        data = request.data.copy()
        
        # Se o usuário não for administrador, sobrescreve os campos 'tombamento' e 'serialnumber'
        if request.user.role != "admin":
            data["tombamento"] = equipment.tombamento
            data["serialnumber"] = equipment.serialnumber

        serializer = self.get_serializer(equipment, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_update(serializer)
        except IntegrityError:
            return Response(
                {"error": "Tombamento ou SerialNumber já cadastrado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        new_stock = serializer.instance.estoque_id
        if old_stock != new_stock:
            EquipmentHistory.objects.create(
                equipment=serializer.instance,
                usuario=request.user,
                alteracoes=f"Movido de estoque {old_stock} para {new_stock}"
            )
        return Response(serializer.data)

    def get_serializer_context(self):
        # Certifique-se de passar a request no contexto
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


    
class EquipmentHistoryViewSet(viewsets.ModelViewSet):
    queryset = EquipmentHistory.objects.all()
    serializer_class = EquipmentHistorySerializer
    permission_classes = [IsAuthenticated]  # Geralmente, o histórico pode ser visto por quem já está autenticado.

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated, CustomUserPermission]

# Novo ViewSet para Estoque
class EstoqueViewSet(viewsets.ModelViewSet):
    queryset = Estoque.objects.all()  # Definindo um queryset padrão
    serializer_class = EstoqueSerializer
    permission_classes = [IsAuthenticated, EstoquePermission]

def get_queryset(self):
    user = self.request.user
    # Se o usuário for superusuário ou pertencer ao grupo "Administrador", retorna todos os estoques.
    if user.is_superuser or user.groups.filter(name="Administrador").exists():
        return Estoque.objects.all()
    # Caso contrário, retorna apenas os estoques associados ao usuário.
    return user.estoques.all()


class LogEquipamentoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LogEquipamento.objects.all().order_by('-data_hora')
    serializer_class = LogEquipamentoSerializer
    permission_classes = [permissions.IsAdminUser]  # Apenas administradores podem ver os logs


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    if request.method == 'GET':
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        # Permite atualização parcial dos dados do usuário
        serializer = CustomUserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer