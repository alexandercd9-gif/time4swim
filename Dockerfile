# Usar Node.js 20
FROM node:20-alpine AS base

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar
CMD ["npm", "start"]
