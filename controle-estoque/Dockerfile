# Etapa de build do React usando uma imagem Node
FROM node:18-alpine AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json (ou yarn.lock) e instala dependências
COPY package.json package-lock.json ./
RUN npm install

# Corrige permissões para evitar o erro "Permission denied"
RUN chmod +x node_modules/.bin/react-scripts

# Copia o restante dos arquivos e cria o build
COPY . .
RUN npm run build

# Etapa final com Nginx para servir o build
FROM nginx:stable-alpine

# Copia os arquivos build do React para o diretório padrão do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Adiciona arquivo de configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 (Não é 3000, pois o Nginx serve na 80)
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
