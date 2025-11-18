# Stage 1: Dependencies
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar node_modules del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código
COPY . .

# Variable de entorno para el build (apunta al servicio backend en Docker)
ARG NEXT_PUBLIC_API_URL=http://localhost:3002
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build de Next.js con standalone output
RUN npm run build

# Stage 3: Production
FROM node:22-alpine AS production

WORKDIR /app

# Variables de entorno de producción
ENV NODE_ENV=production

# Copiar archivos necesarios para standalone
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]
