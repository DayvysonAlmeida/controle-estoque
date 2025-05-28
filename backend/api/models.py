from django.db import models
from django.contrib.auth.models import AbstractUser
from model_utils import FieldTracker  # Certifique-se de ter instalado o django-model-utils

# Definição dos níveis de acesso do usuário.
ROLE_CHOICES = (
    ('leitor', 'Leitor'),
    ('padrao', 'Padrão'),
    ('admin', 'Administrador'),
)

# Modelo Estoque
class Estoque(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)

    def __str__(self):
        return self.nome

# Modelo Customizado de Usuário (única definição)
class CustomUser(AbstractUser):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    funcao = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='padrao')
    estoques = models.ManyToManyField(Estoque, blank=True, related_name="usuarios")

    def __str__(self):
        return self.username

    def is_admin(self):
        return self.role == "admin"  # Facilita verificações no backend


# Modelo de Equipamento
class Equipment(models.Model):
    nome = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    marca = models.CharField(max_length=100)
    categoria = models.CharField(max_length=100)
    tombamento = models.IntegerField(unique=True)   # Garantindo unicidade
    status = models.CharField(max_length=50)
    descricao = models.TextField(blank=True)
    serialnumber = models.CharField(max_length=30, unique=True)   # Garantindo unicidade
    estoque = models.ForeignKey(Estoque, on_delete=models.CASCADE, null=True, blank=True)
    
    tracker = FieldTracker()  # Monitoramento de mudanças
    
    def __str__(self):
        return self.nome

# Modelo para Histórico do Equipamento
class EquipmentHistory(models.Model):
    equipment = models.ForeignKey(Equipment, related_name='historicos', on_delete=models.CASCADE)
    data_hora = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    alteracoes = models.TextField()

    def __str__(self):
        return f"Histórico de {self.equipment.nome} em {self.data_hora}"

# Modelo de Logs para Equipamentos
class LogEquipamento(models.Model):
    ACAO_CHOICES = [
        ('ADICIONADO', 'Adicionado'),
        ('ATUALIZADO', 'Atualizado'),
        ('EXCLUIDO', 'Excluído'),
    ]
    # Utilizamos SET_NULL para preservar os logs mesmo se o equipamento for removido.
    equipamento = models.ForeignKey(
        Equipment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="logs"
    )
    usuario = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    acao = models.CharField(max_length=20, choices=ACAO_CHOICES)
    data_hora = models.DateTimeField(auto_now_add=True)
    detalhes = models.TextField(blank=True, null=True)

    def __str__(self):
        equipamento_nome = self.equipamento.nome if self.equipamento else "Equipamento excluído"
        usuario_str = self.usuario.username if self.usuario else "Desconhecido"
        return f"{equipamento_nome} - {self.acao} por {usuario_str} em {self.data_hora}"
