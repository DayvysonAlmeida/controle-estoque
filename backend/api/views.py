from django.db import IntegrityError
from django.db.models import Count
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
        """
        Versão corrigida que aplica os filtros de forma segura (Tenant).
        """
        qs = super().get_queryset().order_by("-id")
        user = self.request.user
        
        # Filtro de Tenant: Usuários padrão só veem equipamentos dos seus estoques permitidos
        if not (user.is_superuser or user.is_admin()):
            qs = qs.filter(estoque__in=user.estoques.all())

        params = self.request.query_params

        # Filtro por estoque (CORRIGIDO)
        estoque_id = params.get('estoque')
        if estoque_id:
            # A forma correta de filtrar por uma ForeignKey
            qs = qs.filter(estoque=estoque_id)

        # Filtros de texto (busca "contém", ignorando maiúsculas/minúsculas)
        text_filters = ['nome', 'marca', 'modelo', 'serialnumber', 'ip', 'categoria']
        for field in text_filters:
            value = params.get(field)
            if value:
                qs = qs.filter(**{f'{field}__icontains': value})

        # Filtro de texto exato para tombamento
        tombamento = params.get('tombamento')
        if tombamento:
            qs = qs.filter(tombamento__icontains=tombamento)

        # Filtro de correspondência exata para status
        status_filter = params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        equipment = self.get_object()
        old_stock = equipment.estoque_id
        
        data = request.data.copy()
        
        serializer = self.get_serializer(equipment, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        new_stock = serializer.instance.estoque_id
        if old_stock != new_stock:
            EquipmentHistory.objects.create(
                equipment=serializer.instance,
                usuario=request.user,
                alteracoes=f"Movido de estoque {old_stock} para {new_stock}"
            )
        return Response(serializer.data)

    def get_serializer_context(self):
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
        if user.is_superuser or user.is_admin():
            return Estoque.objects.all()
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    user = request.user
    if user.is_superuser or user.is_admin():
        user_estoques = Estoque.objects.all()
    else:
        user_estoques = user.estoques.all()

    qs = Equipment.objects.filter(estoque__in=user_estoques)
    
    estoque_id = request.query_params.get('estoque')
    if estoque_id:
        qs = qs.filter(estoque_id=estoque_id)

    status_counts = qs.values('status').annotate(total=Count('id'))
    
    metrics = {
        "total": qs.count(),
        "ativo": 0,
        "manutencao": 0,
        "inativo": 0,
        "substituida": 0,
        "backup": 0,
    }
    
    status_map = {
        "Ativo": "ativo",
        "Manutenção": "manutencao",
        "Inativo": "inativo",
        "Substituída": "substituida",
        "Backup": "backup",
    }

    for item in status_counts:
        st = item['status']
        if st in status_map:
            metrics[status_map[st]] = item['total']

    base_qs = Equipment.objects.filter(estoque__in=user_estoques)
    estoque_counts = base_qs.values('estoque__id', 'estoque__nome').annotate(total=Count('id'))
    
    metrics["por_estoque"] = [
        {
            "id": item['estoque__id'],
            "nome": item['estoque__nome'],
            "total": item['total']
        } for item in estoque_counts
    ]

    return Response(metrics)