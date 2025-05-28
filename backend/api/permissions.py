from rest_framework.permissions import BasePermission, SAFE_METHODS

class EquipmentPermission(BasePermission):
    """
    Permissão para o EquipmentViewSet:
      - Usuários do grupo "Leitor": apenas métodos seguros.
      - Usuários do grupo "Padrão": podem usar GET, POST, PUT/PATCH; mas não DELETE.
      - Usuários do grupo "Administrador" (ou superusuários): acesso completo.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        # Se o usuário for superusuário ou pertence ao grupo "Administrador", permitir acesso total.
        if request.user.is_superuser or request.user.groups.filter(name="Administrador").exists():
            return True

        # Se o usuário pertence ao grupo "Padrão", permitir criação e atualização, mas não DELETE.
        if request.user.groups.filter(name="Padrão").exists():
            return request.method != 'DELETE'

        # Usuários do grupo "Leitor" (ou sem grupo específico) não podem fazer métodos não seguros.
        return False

class EstoquePermission(BasePermission):
    """
    Permissão para o EstoqueViewSet:
      - Métodos seguros serão permitidos para todos os perfis.
      - Apenas usuários do grupo "Administrador" (ou superusuários) podem criar, atualizar ou deletar estoques.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        # Permite alterações somente aos superusuários ou aos que pertencem ao grupo "Administrador"
        return request.user.is_superuser or request.user.groups.filter(name="Administrador").exists()

class CustomUserPermission(BasePermission):
    """
    Permissão para o CustomUserViewSet:
      - Métodos seguros são permitidos para todos.
      - Apenas usuários do grupo "Administrador" (ou superusuários) podem modificar (criar, editar ou deletar) os usuários.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        # Permite alterações somente aos superusuários ou aos que pertencem ao grupo "Administrador"
        return request.user.is_superuser or request.user.groups.filter(name="Administrador").exists()
