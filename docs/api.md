# API

Base URL: `/api/`

Endpoints principais (implementados no projeto):

- `POST /api/token/` — Obter `access` e `refresh` (login)
  - Body JSON: `{ "username": "...", "password": "..." }`
  - Exemplo (PowerShell):
    ```powershell
    Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/api/token/' -Body (@{username='seuusuario'; password='suasenha'} | ConvertTo-Json) -ContentType 'application/json'
    ```

- `POST /api/token/refresh/` — Refresh do token
  - Body JSON: `{ "refresh": "<refresh_token>" }`

- `GET /api/profile/` — Recupera perfil do usuário (requer Authorization header `Bearer <access>`)

ViewSets registrados no router (exemplos):
- `equipments` — `/api/equipments/`
- `equipment-history` — `/api/equipment-history/`
- `users` — `/api/users/`
- `estoques` — `/api/estoques/`
- `logs` — `/api/logs/`
- `groups` — `/api/groups/`

Autenticação
- O backend usa `rest_framework_simplejwt`.
- Envie `Authorization: Bearer <access_token>` nos headers para endpoints protegidos.

Paginação
- A API usa `api.pagination.CustomPagination` como padrão (ver `api/pagination.py`).

Erros comuns
- 401 Unauthorized: token inválido/expirado — usar endpoint de refresh ou efetuar login novamente.
- 404 Not Found: endpoint incorreto — verifique base URL (`REACT_APP_API_URL`) no frontend.
