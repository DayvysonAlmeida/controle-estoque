# Generated by Django 5.2 on 2025-04-28 14:38

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_equipment_tombamento'),
    ]

    operations = [
        migrations.CreateModel(
            name='LogEquipamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('acao', models.CharField(choices=[('ADICIONADO', 'Adicionado'), ('ATUALIZADO', 'Atualizado'), ('EXCLUIDO', 'Excluído')], max_length=20)),
                ('data_hora', models.DateTimeField(auto_now_add=True)),
                ('detalhes', models.TextField(blank=True, null=True)),
                ('equipamento', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='logs', to='api.equipment')),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
