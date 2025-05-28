from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Equipment, LogEquipamento
from crum import get_current_user

@receiver(post_save, sender=Equipment)
def log_equipamento_save(sender, instance, created, **kwargs):
    current_user = get_current_user()
    if not current_user or (hasattr(current_user, "is_anonymous") and current_user.is_anonymous):
        current_user = None

    # Pega o nome do estoque atual ou "Sem estoque"
    estoque_nome = instance.estoque.nome if instance.estoque else "Sem estoque"
    
    if created:
        acao = 'ADICIONADO'
        detalhes = (
            f"Nome: {instance.nome}, Modelo: {instance.modelo}, Marca: {instance.marca}, "
            f"Categoria: {instance.categoria}, Status: {instance.status}, "
            f"Tombamento: {instance.tombamento}, Serial: {instance.serialnumber}, "
            f"Estoque: {estoque_nome}"
        )
    else:
        acao = 'ATUALIZADO'
        changes = instance.tracker.changed()
        if changes:
            detalhes_list = []
            for field, old_value in changes.items():
                new_value = getattr(instance, field)
                # Se o campo editado for o estoque, tenta destacar a mudança de nome
                if field == 'estoque_id':
                    old_estoque = "Sem estoque"
                    new_estoque = "Sem estoque"
                    if old_value:
                        # Se necessário, você pode buscar pelo id antigo para obter o nome,
                        # mas aqui é ilustrado apenas com o id.
                        old_estoque = f"Estoque ID {old_value}"
                    if new_value:
                        new_estoque = instance.estoque.nome
                    detalhes_list.append(f"estoque: {old_estoque} → {new_estoque}")
                else:
                    detalhes_list.append(f"{field}: {old_value} → {new_value}")
            detalhes = ", ".join(detalhes_list)
        else:
            detalhes = "Nenhuma alteração detectada."
    
    LogEquipamento.objects.create(
        equipamento=instance,
        usuario=current_user,
        acao=acao,
        detalhes=detalhes
    )

@receiver(pre_delete, sender=Equipment)
def log_equipamento_delete(sender, instance, **kwargs):
    current_user = get_current_user()
    if not current_user or (hasattr(current_user, "is_anonymous") and current_user.is_anonymous):
        current_user = None

    estoque_nome = instance.estoque.nome if instance.estoque else "Sem estoque"
    detalhes = (
        f"Nome: {instance.nome}, Modelo: {instance.modelo}, Marca: {instance.marca}, "
        f"Categoria: {instance.categoria}, Status: {instance.status}, "
        f"Tombamento: {instance.tombamento}, Serial: {instance.serialnumber}, "
        f"Estoque: {estoque_nome}"
    )
    # Usa pre_delete para que o log seja criado antes que o equipamento seja removido
    LogEquipamento.objects.create(
        equipamento=None,  # Evita erro de integridade referencial
        usuario=current_user,
        acao='EXCLUIDO',
        detalhes=detalhes
    )
