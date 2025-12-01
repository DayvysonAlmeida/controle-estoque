# Documentação Detalhada da API

Base URL: `/api/`

Esta página descreve os endpoints principais, campos esperados, validações e exemplos de requisições.

---

## Autenticação

- **POST /api/token/**
  - Descrição: Obtém `access` e `refresh` tokens (login).
  - Sem autenticação.
  - Body JSON:
    - `username` (string) — obrigatório
    - `password` (string) — obrigatório
  - Exemplo (PowerShell):
    ```powershell
    Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/api/token/' -Body (@{username='seuusuario'; password='suasenha'} | ConvertTo-Json) -ContentType 'application/json'
    ```
  - Resposta (200):
    ```json
    { "access": "<jwt_access>", "refresh": "<jwt_refresh>" }
    ```

- **POST /api/token/refresh/**
  - Descrição: Atualiza o `access` a partir do `refresh`.
  - Body JSON: `{ "refresh": "<refresh_token>" }`
  - Resposta: `{ "access": "<novo_access>" }`

---

## Perfil do usuário

- **GET /api/profile/**
  - Descrição: Retorna os dados do usuário autenticado.
  - Autenticação: `Authorization: Bearer <access>`
  - Resposta (exemplo):
    ```json
    {
      "id": 1,
      "username": "usuario",
      "nome": "Nome Completo",
      "email": "email@example.com",
      "funcao": "TI",
      "role": "padrao",
      "estoques": [1, 2],
      "groups": [{"id":1, "name":"Administrador"}],
    }
    ```

- **PUT/PATCH /api/profile/**
  - Descrição: Atualiza campos do próprio usuário (parcial permitido).
  - Campos aceitos (parciais permitidos): `username`, `nome`, `email`, `funcao`, `role`, `estoques` (lista de IDs), `groups_ids` (apenas para admins), `password` (write-only para alteração).

---

## Equipamentos

- **/api/equipments/** (ModelViewSet)
  - Métodos: `GET` (list), `POST` (create)
  - **GET /api/equipments/** — parâmetros de query suportados:
    - `estoque` (id)
    - `nome`, `marca`, `modelo`, `serialnumber`, `ip`, `categoria` (busca `icontains`)
    - `tombamento` (busca por substring)
    - `status` (igual)
  - **POST /api/equipments/** — criação de equipamento.
    - Campos (request JSON):
      - `nome` (string) — obrigatório
      - `modelo` (string)
      - `marca` (string)
      - `tombamento` (string) — obrigatório a menos que `sem_tombamento=true`
      - `serialnumber` (string)
      - `status` (string)
      - `descricao` (string)
      - `categoria` (string)
      - `estoque` (integer id do `Estoque`) — obrigatório
      - `ip` (string, opcional)
      - `sem_tombamento` (boolean, write-only) — se true faz com que `tombamento` seja aceito como ausente
    - Regras importantes:
      - O serializer valida que `tombamento` seja informado a menos que `sem_tombamento` seja `true`.
      - `estoque` é enviado como ID (PrimaryKey).
      - Em atualização (`PUT`/`PATCH`), se o usuário não for admin, o `tombamento` e `serialnumber` enviados serão ignorados — apenas admins podem alterar esses campos.
      - Possíveis erros: `400` com `{ "error": "Tombamento ou SerialNumber já cadastrado." }` quando há conflito de unicidade.

- **/api/equipments/{id}/**
  - Métodos: `GET`, `PUT`, `PATCH`, `DELETE` (dependendo das permissões)
  - Permissões (`EquipmentPermission`):
    - Grupo `Leitor`: somente métodos seguros (`GET`)
    - Grupo `Padrão`: pode `GET`, `POST`, `PUT`/`PATCH` mas **não** `DELETE`
    - `Administrador` ou superuser: acesso total

Resposta de exemplo (GET equipamento):
```json
{
  "id": 10,
  "nome": "Notebook X",
  "modelo": "X100",
  "marca": "MarcaY",
  "tombamento": "T-0001",
  "serialnumber": "SN123456",
  "status": "Em uso",
  "descricao": "Descrição...",
  "categoria": "Computador",
  "estoque": 1,
  "ip": "192.168.0.10"
}
```

---

## Histórico de Equipamento

- **/api/equipment-history/** (ModelViewSet)
  - Métodos: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` dependendo de permissões padrão do projeto (autenticação requerida).
  - Campos (conforme `EquipmentHistory`):
    - `id`
    - `equipment` (ID do `Equipment`)
    - `data_hora` (datetime, auto)
    - `usuario` (ID do usuário ou `null`)
    - `alteracoes` (texto)

---

## Usuários

- **/api/users/** (ModelViewSet)
  - Permissões (`CustomUserPermission`): apenas admins/superusers podem criar/editar/deletar; métodos seguros permitidos para todos os autenticados.
  - Serializer (`CustomUserSerializer`) — campos importantes:
    - `id`
    - `username` (string)
    - `nome` (string)
    - `email` (string)
    - `funcao` (string)
    - `role` (string: `leitor` | `padrao` | `admin`)
    - `estoques` (lista de IDs de `Estoque`)
    - `groups` (lista de objetos `{id, name}`) — read-only
    - `groups_ids` (lista de IDs) — write-only para atribuir grupos
    - `password` — write-only (obrigatório na criação; usado para alteração quando presente)

  - Exemplo de criação (POST):
    ```json
    {
      "username": "novo",
      "nome": "Novo Usuario",
      "email": "novo@example.com",
      "password": "senhaSegura",
      "role": "padrao",
      "estoques": [1],
      "groups_ids": [2]
    }
    ```

---

## Estoques

- **/api/estoques/** (ModelViewSet)
  - Campos do `EstoqueSerializer`:
    - `id`, `nome`, `descricao`
  - Permissões (`EstoquePermission`):
    - Métodos seguros (`GET`) permitidos para usuários autenticados
    - Criação/edição/exclusão permitidos apenas para admins/superusers

---

## Logs de Equipamento

- **/api/logs/**
  - ViewSet apenas leitura (`ReadOnlyModelViewSet`) e permissões `IsAdminUser` — somente administradores podem ver os logs.
  - Campos retornados (`LogEquipamentoSerializer`):
    - `id`
    - `equipamento` (nome do equipamento — via `SerializerMethodField`)
    - `usuario` (username ou `Desconhecido`)
    - `acao` (enum: `ADICIONADO` | `ATUALIZADO` | `EXCLUIDO`)
    - `data_hora` (datetime)
    - `detalhes` (texto)

---

## Grupos

- **/api/groups/**
  - `ReadOnlyModelViewSet` — retorna listas de grupos do Django (`id`, `name`).

---

## Observações gerais
- Autenticação: envie o header `Authorization: Bearer <access>` em todas as requisições a endpoints protegidos.
- Paginação: a API utiliza `api.pagination.CustomPagination` como padrão.
- CORS: no desenvolvimento, as configurações de `mybackend/settings.py` permitem `CORS_ORIGIN_ALLOW_ALL = True` e incluem `http://localhost:3000` em `CORS_ALLOWED_ORIGINS`.

---

Se desejar, eu posso:
- Gerar uma coleção Postman/Insomnia com exemplos prontos (login, refresh, CRUD `equipments`).
- Adicionar exemplos de resposta completa para cada endpoint.
- Gerar documentação OpenAPI/Swagger a partir do projeto (configurar `drf-yasg` ou `drf-spectacular`).
