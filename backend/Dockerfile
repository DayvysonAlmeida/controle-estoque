# Usa a imagem oficial do Python
FROM python:3.10

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependências para o contêiner
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia o projeto para o contêiner
COPY . .

# Expõe a porta do Django (caso não esteja usando o servidor Apache ou Nginx)
EXPOSE 8080

# Comando para iniciar o Django
CMD ["gunicorn", "--workers=4", "--timeout=120", "--bind", "0.0.0.0:4000", "mybackend.wsgi:application"]


