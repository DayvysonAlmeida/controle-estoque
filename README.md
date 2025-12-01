# Controle Estoque

![Banner do Projeto](./docs/assets/banner.svg)

Projeto de controle de estoque com backend em Django REST Framework e frontend em React.

**Resumo rápido**
- Backend: Django + DRF + Simple JWT
- Frontend: React (Create React App)
- Autenticação: JWT (endpoints `/api/token/` e `/api/token/refresh/`)
- API base: `/api/`

**Conteúdo**
- `backend/` — código Django
- `frontend/` — app React
- `docker-compose.yml` — orquestração (opcional)

**Documentação**
- Setup backend: `docs/setup-backend.md`
- Setup frontend: `docs/setup-frontend.md`
- API: `docs/api.md`
- Arquitetura: `docs/architecture.md`

## Começando (desenvolvimento local)

Requisitos:
- Python 3.10+ (ou conforme seu ambiente)
- Node.js 16+ / npm

1) Backend (rodando localmente):
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

2) Frontend:
```powershell
cd frontend
npm install
npm start
```

OBS: o frontend lê a variável `REACT_APP_API_URL` em `frontend/.env` — reinicie o dev server se alterar esse arquivo.

## Próximos passos
- Consulte os arquivos em `docs/` para detalhes de variáveis de ambiente, endpoints da API e execução via Docker.

---
Se quiser, posso gerar também um `CHANGELOG.md` ou um arquivo `CONTRIBUTING.md` com padrões de contribuição.

## Apresentação

- Uma apresentação visual do projeto e imagens de exemplo está em `docs/presentation.md`.

Veja a apresentação: [docs/presentation.md](docs/presentation.md)

Sugestão rápida para LinkedIn/GitHub README: use a imagem `./docs/assets/banner.svg` como destaque e inclua um parágrafo objetivo sobre o problema que o projeto resolve.
