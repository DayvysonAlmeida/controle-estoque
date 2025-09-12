# api/pagination.py

from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    """
    Paginação personalizada que permite ao frontend definir o tamanho da página.
    """
    page_size_query_param = 'page_size'  # O nome do parâmetro na URL (ex: ?page_size=50)
    max_page_size = 100                  # Um limite máximo para proteger o seu servidor