# 🐳 Sistema de Taller - Despliegue con Docker

Este proyecto está completamente containerizado usando Docker y Docker Compose, facilitando el despliegue en cualquier entorno.

## 📋 Prerequisitos

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)

## 🏗️ Arquitectura de Contenedores

El sistema está compuesto por 3 servicios:

1. **postgres** - Base de datos PostgreSQL 16
2. **backend** - API REST con NestJS (puerto 3002)
3. **frontend** - Aplicación web con Next.js (puerto 3000)

## 🚀 Despliegue Rápido

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd sistema_taller
```

### 2. Configurar variables de entorno (opcional)
Por defecto, el sistema usa las credenciales del `.env.example`. Para producción:

```bash
cp .env.example .env
# Edita .env con tus valores personalizados
```

### 3. Iniciar todos los servicios
```bash
docker-compose up --build
```

El sistema estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **PostgreSQL**: localhost:5432

### 4. Detener los servicios
```bash
# Detener sin eliminar contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Eliminar todo (incluyendo volúmenes de base de datos)
docker-compose down -v
```

## 📦 Comandos Útiles

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Reconstruir un servicio específico
```bash
docker-compose up --build backend
```

### Ejecutar comandos dentro de contenedores
```bash
# Acceder a shell del backend
docker-compose exec backend sh

# Ejecutar migraciones de Prisma manualmente
docker-compose exec backend npx prisma migrate deploy

# Ver base de datos con Prisma Studio
docker-compose exec backend npx prisma studio
```

### Ver estado de contenedores
```bash
docker-compose ps
```

## 🔧 Configuración Avanzada

### Variables de Entorno

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://postgres:zowy3427@postgres:5432/taller_db
JWT_SECRET=tu-secreto-super-seguro-cambialo-en-produccion-12345
JWT_EXPIRATION=7d
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Healthchecks

Los servicios tienen healthchecks configurados:
- **postgres**: `pg_isready` cada 10s
- **backend**: HTTP request a puerto 3002 cada 30s
- **frontend**: Depende del estado saludable del backend

### Volúmenes Persistentes

La base de datos PostgreSQL usa un volumen nombrado `postgres_data` para persistir los datos entre reinicios.

## 🏭 Producción

### Cambios recomendados para producción:

1. **Actualizar credenciales**:
   - Cambiar `POSTGRES_PASSWORD`
   - Generar nuevo `JWT_SECRET`

2. **Usar variables de entorno**:
   ```bash
   docker-compose --env-file .env.production up -d
   ```

3. **Habilitar HTTPS** (usar proxy reverso como Nginx o Traefik)

4. **Limitar recursos**:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

5. **Backups automáticos** de la base de datos

## 🐛 Troubleshooting

### El backend no se conecta a la base de datos
- Verificar que el servicio `postgres` esté saludable: `docker-compose ps`
- Revisar logs: `docker-compose logs postgres`

### El frontend no puede acceder al backend
- Verificar que `NEXT_PUBLIC_API_URL` esté correctamente configurado
- En Docker, el frontend debe usar `http://localhost:3002` (desde el navegador)
- Para SSR, podría necesitar `http://backend:3002`

### Las migraciones no se ejecutan
- Ejecutar manualmente: `docker-compose exec backend npx prisma migrate deploy`
- Verificar que la base de datos esté accesible

### Puerto ya en uso
```bash
# Cambiar puertos en docker-compose.yml
ports:
  - "3001:3000"  # frontend
  - "3003:3002"  # backend
  - "5433:5432"  # postgres
```

## 📚 Estructura del Proyecto

```
sistema_taller/
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── next.config.js  (standalone mode)
│   └── src/
├── docker-compose.yml
├── .env.example
└── DOCKER_README.md
```

## ✅ Verificación del Despliegue

1. Verificar que todos los contenedores estén corriendo:
   ```bash
   docker-compose ps
   ```

2. Probar el backend:
   ```bash
   curl http://localhost:3002
   ```

3. Abrir el frontend en el navegador: http://localhost:3000

4. Verificar logs sin errores:
   ```bash
   docker-compose logs --tail=50
   ```

## 🔄 Actualización del Sistema

```bash
# 1. Detener servicios
docker-compose down

# 2. Actualizar código
git pull

# 3. Reconstruir imágenes
docker-compose build --no-cache

# 4. Iniciar servicios
docker-compose up -d
```

## 📞 Soporte

Para problemas o preguntas sobre el despliegue con Docker, revisar:
- Logs de contenedores: `docker-compose logs`
- Estado de servicios: `docker-compose ps`
- Documentación oficial de Docker: https://docs.docker.com
