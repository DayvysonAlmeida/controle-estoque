# Setup Frontend

Passo a passo para configurar o frontend React (desenvolvimento).

1) Instalar dependências

```powershell
cd frontend
npm install
```

2) Variáveis de ambiente

Crie `frontend/.env` com a variável abaixo (exemplo):

```dotenv
REACT_APP_API_URL=http://localhost:8000/api/
```

Reinicie o servidor de desenvolvimento sempre que alterar o `.env`.

3) Rodar em modo desenvolvimento

```powershell
npm start
```

4) Build para produção

```powershell
npm run build
```

5) Observações
- Certifique-se de que o backend esteja acessível na URL configurada.
- Se for acessar a API de outro dispositivo na rede, use o IP da máquina (ex.: `http://192.168.0.112:8000/api/`).
