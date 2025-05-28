from django.contrib.auth.models import Group
from rest_framework import serializers
from .models import Equipment, EquipmentHistory, CustomUser, Estoque, LogEquipamento

# Serializer para Estoque
class EstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estoque
        fields = ('id', 'nome', 'descricao')

# Serializer para Equipment
class EquipmentSerializer(serializers.ModelSerializer):
    estoque = serializers.PrimaryKeyRelatedField(queryset=Estoque.objects.all())
  
    class Meta:
        model = Equipment
        fields = [
            'id', 'nome', 'modelo', 'marca', 'tombamento', 
            'serialnumber', 'status', 'descricao', 'estoque', 'categoria'
        ]

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.role != "admin":
            validated_data.pop("tombamento", None)
            validated_data.pop("serialnumber", None)
        return super().update(instance, validated_data)

# Serializer para Equipment History
class EquipmentHistorySerializer(serializers.ModelSerializer):
    usuario = serializers.SerializerMethodField()
    
    class Meta:
        model = EquipmentHistory
        fields = '__all__'
    
    def get_usuario(self, obj):
        if obj.usuario:
            return obj.usuario.username
        return "Desconhecido"

# Serializer para o Grupo
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('id', 'name')

# Serializer para o CustomUser
class CustomUserSerializer(serializers.ModelSerializer):
    # Campo de leitura: já existente com PrimaryKeyRelatedField
    estoques = serializers.PrimaryKeyRelatedField(queryset=Estoque.objects.all(), many=True)
    # Outros campos de groups (read e write)
    groups = GroupSerializer(many=True, read_only=True)
    groups_ids = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'nome', 'email', 'funcao', 'role', 'estoques', 'groups', 'groups_ids', 'password')

    def create(self, validated_data):
        # Retira o campo many-to-many 'estoques' e o dos grupos write-only dos dados validados
        estoque_data = validated_data.pop("estoques", [])
        groups_data = validated_data.pop("groups_ids", [])
        password = validated_data.pop("password", None)
        
        # Cria a instância do usuário sem os dados many-to-many
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        
        # Atribui os grupos e os estoques usando o método .set()
        if groups_data:
            user.groups.set(groups_data)
        if estoque_data:
            user.estoques.set(estoque_data)
        return user

    def update(self, instance, validated_data):
        # Processo similar para update se houver necessidade
        estoque_data = validated_data.pop("estoques", None)
        groups_data = validated_data.pop("groups_ids", None)
        password = validated_data.pop("password", None)
        
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        if groups_data is not None:
            instance.groups.set(groups_data)
        if estoque_data is not None:
            instance.estoques.set(estoque_data)
        return instance

# Serializer para Log de Equipamento
class LogEquipamentoSerializer(serializers.ModelSerializer):
    usuario = serializers.SerializerMethodField()
    equipamento = serializers.SerializerMethodField()
    
    class Meta:
        model = LogEquipamento
        fields = ('id', 'equipamento', 'usuario', 'acao', 'data_hora', 'detalhes')

    def get_usuario(self, obj):
        if obj.usuario:
            return obj.usuario.username
        return "Desconhecido"

    def get_equipamento(self, obj):
        if obj.equipamento:
            return obj.equipamento.nome
        return ""
