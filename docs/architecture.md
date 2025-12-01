# Arquitetura do Projeto

Visão geral dos componentes:

- Backend (`backend/`)
  - Django REST Framework
  - JWT com `rest_framework_simplejwt`
  - App principal: `api` (models, serializers, views, permissions)

- Frontend (`frontend/`)
  - React (Create React App)
  - `src/services/api.js` cria uma instância Axios com `REACT_APP_API_URL` e interceptores para refresh de token

- Orquestração (opcional)
  - `docker-compose.yml` configura containers para backend e frontend (em produção ou dev containerizado)

Fluxo de autenticação:
1. Frontend envia credenciais para `/api/token/`.
2. Backend retorna `access` e `refresh`.
3. Axios salva tokens em `localStorage` e anexa `Authorization: Bearer <access>`.
4. Quando `401` por token expirado, interceptor usa `/api/token/refresh/` para obter novo `access` (se `refresh` válido).
