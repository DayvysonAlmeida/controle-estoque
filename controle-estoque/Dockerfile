# ---------------------------------------------------
# 1) Etapa de desenvolvimento
# ---------------------------------------------------
FROM node:18-alpine AS dev
WORKDIR /app

# Copia apenas o package.json e package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Copia o restante dos arquivos e mantém o dev server
COPY . .
ENV CHOKIDAR_USEPOLLING=true
EXPOSE 3000

CMD ["npm", "start"]


# ---------------------------------------------------
# 2) Etapa de build para produção
# ---------------------------------------------------
FROM node:18-alpine AS build
WORKDIR /app

# Instala dependências de produção
COPY package.json package-lock.json ./
RUN npm install

# Gera o build otimizado
COPY . .
RUN npm run build


# ---------------------------------------------------
# 3) Etapa final de produção (Nginx)
# ---------------------------------------------------
FROM nginx:stable-alpine AS prod
# Copia o build gerado para o diretório de conteúdo do Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Substitua ou ajuste se tiver configurações customizadas
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
