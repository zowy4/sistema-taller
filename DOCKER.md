# Sistema de Taller - Docker Setup

## 🚀 Inicio Rápido

### Requisitos previos
- Docker 20.10+
- Docker Compose 2.0+

### Levantar todo el sistema

```bash
# Construir y levantar todos los servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Acceso a los servicios
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **PostgreSQL**: localhost:5432

### Credenciales por defecto
- **PostgreSQL**:
  - Usuario: `postgres`
  - Password: `zowy3427`
  - Base de datos: `taller_db`

- **Usuario admin del sistema**:
  - Email: `admin@taller.com`
  - Password: `admin123`

## 🛠️ Comandos útiles

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la base de datos)
docker-compose down -v

# Reconstruir un servicio específico
docker-compose up -d --build backend

# Ver estado de los servicios
docker-compose ps

# Ejecutar comandos en el backend
docker-compose exec backend npm run prisma:studio
docker-compose exec backend npx prisma migrate dev

# Ejecutar comandos en el frontend
docker-compose exec frontend npm run lint

# Acceder a la shell del contenedor
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d taller_db
```

## 🔧 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
POSTGRES_USER=postgres
POSTGRES_PASSWORD=zowy3427
POSTGRES_DB=taller_db

# Backend
DATABASE_URL=postgresql://postgres:zowy3427@postgres:5432/taller_db
JWT_SECRET=tu-secreto-super-seguro-cambialo-en-produccion-12345
JWT_EXPIRATION=7d

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 📦 Estructura de contenedores

```
┌─────────────────┐
│   Frontend      │  Port 3000
│   (Next.js)     │  
└────────┬────────┘
         │
         │ HTTP Requests
         ▼
┌─────────────────┐
│   Backend       │  Port 3002
│   (NestJS)      │  
└────────┬────────┘
         │
         │ Prisma ORM
         ▼
┌─────────────────┐
│   PostgreSQL    │  Port 5432
│   (Database)    │  
└─────────────────┘
```

## 🐛 Troubleshooting

### El backend no se conecta a la base de datos
```bash
# Verificar que postgres esté saludable
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Reiniciar el backend
docker-compose restart backend
```

### Error de migraciones de Prisma
```bash
# Ejecutar migraciones manualmente
docker-compose exec backend npx prisma migrate deploy

# Reset completo (¡CUIDADO! Borra datos)
docker-compose exec backend npx prisma migrate reset --force
```

### Frontend no se conecta al backend
- Verificar que `NEXT_PUBLIC_API_URL` apunte a `http://localhost:3002`
- El frontend debe hacer requests desde el navegador, no desde el contenedor

### Puerto ya en uso
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3002
netstat -ano | findstr :5432

# Cambiar puertos en docker-compose.yml
ports:
  - "3001:3000"  # Usar puerto 3001 en el host
```

## 🌐 Despliegue en VPS

### 1. Instalar Docker en el VPS
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 2. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sistema-taller.git
cd sistema-taller
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
nano .env  # Editar con valores de producción
```

### 4. Levantar con Docker Compose
```bash
docker-compose up -d --build
```

### 5. Configurar Nginx como reverse proxy
```nginx
server {
    listen 80;
    server_name api.tudominio.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. SSL con Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d api.tudominio.com
```

## 📊 Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=100

# Inspeccionar contenedor
docker inspect taller_backend
```

## 🔄 Actualización

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Ver logs para verificar
docker-compose logs -f
```
