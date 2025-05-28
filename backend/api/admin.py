from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Equipment, EquipmentHistory, CustomUser, Estoque, LogEquipamento  # Importa o LogEquipamento também

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('username', 'email', 'nome', 'funcao', 'role', 'get_groups')
    list_filter = ('role', 'estoques', 'groups')
    
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('nome', 'funcao', 'estoques', 'role')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('nome', 'funcao', 'estoques', 'role')}),
    )

    filter_horizontal = ('estoques', 'groups',)

    def get_groups(self, obj):
        return ", ".join([g.name for g in obj.groups.all()])
    get_groups.short_description = 'Grupos'

class EquipmentHistoryAdmin(admin.ModelAdmin):
    model = EquipmentHistory
    list_display = ('equipment', 'usuario', 'data_hora', 'alteracoes')  
    list_filter = ('usuario', 'data_hora')  
    ordering = ('-data_hora',)  
    search_fields = ('equipment__nome', 'usuario__username', 'alteracoes')

# Nova classe para administração do log de equipamentos
class LogEquipamentoAdmin(admin.ModelAdmin):
    model = LogEquipamento
    list_display = ('id', 'equipamento', 'usuario', 'acao', 'data_hora', 'detalhes')
    list_filter = ('acao', 'usuario', 'data_hora')
    ordering = ('-data_hora',)
    search_fields = ('equipamento__nome', 'usuario__username', 'detalhes')

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Equipment)
admin.site.register(EquipmentHistory, EquipmentHistoryAdmin)
admin.site.register(Estoque)
admin.site.register(LogEquipamento, LogEquipamentoAdmin)
