# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo dev para Prisma)
RUN npm ci

# Copiar el resto del código
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# Generar Prisma Client en producción
RUN npx prisma generate

# Copiar archivos compilados del stage anterior
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3002

# Comando de inicio con migraciones automáticas
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
