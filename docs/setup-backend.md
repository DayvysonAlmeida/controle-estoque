# Setup Backend

Passo a passo para rodar o backend (Django) em desenvolvimento.

1) Preparar ambiente

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2) Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do `backend` ou defina variáveis no ambiente. Variáveis comuns usadas no projeto (exemplo):

```dotenv
SECRET_KEY=your_secret_key_here
MYSQL_DATABASE=nome_db
MYSQL_USER=usuario
MYSQL_PASSWORD=senha
MYSQL_HOST=localhost
MYSQL_PORT=3306
```

3) Migrar e criar superuser

```powershell
python manage.py migrate
python manage.py createsuperuser
```

4) Rodar em modo dev

```powershell
python manage.py runserver 0.0.0.0:8000
```

5) Observações
- O projeto já expõe os endpoints da API em `/api/` (ver `mybackend/urls.py`).
- Se preferir rodar com Docker, use `docker-compose up --build` a partir da raiz do repositório.
