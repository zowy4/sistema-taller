# 🐳 Contenerización con Docker - Sistema Taller

Este proyecto está completamente dockerizado para facilitar el despliegue en cualquier servidor.

## 📦 Arquitectura de Contenedores

El sistema consta de **3 contenedores**:

1. **PostgreSQL** (Base de Datos) - Puerto 5432
2. **NestJS Backend** (API REST) - Puerto 3002
3. **Next.js Frontend** (Interfaz Web) - Puerto 3000

## 🚀 Inicio Rápido

### Requisitos Previos

- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido con Docker Desktop)

### Comandos Principales

#### 1️⃣ Construir y Levantar Todo el Sistema

```bash
docker-compose up --build
```

Este comando:
- ✅ Descarga la imagen de PostgreSQL
- ✅ Construye la imagen del Backend
- ✅ Construye la imagen del Frontend
- ✅ Levanta los 3 contenedores en orden
- ✅ Ejecuta migraciones de base de datos automáticamente

#### 2️⃣ Detener el Sistema

```bash
# Detener contenedores (mantiene datos)
docker-compose down

# Detener Y eliminar volúmenes (borra la BD)
docker-compose down -v
```

#### 3️⃣ Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

#### 4️⃣ Reiniciar un Servicio Específico

```bash
docker-compose restart backend
docker-compose restart frontend
```

## 🌐 URLs de Acceso

Una vez levantados los contenedores:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **Base de Datos**: localhost:5432

## 🔧 Configuración

### Variables de Entorno

Edita el archivo `docker-compose.yml` para cambiar:

#### PostgreSQL:
```yaml
POSTGRES_USER: postgres
POSTGRES_PASSWORD: zowy3427  # ⚠️ CAMBIAR EN PRODUCCIÓN
POSTGRES_DB: taller_db
```

#### Backend:
```yaml
DATABASE_URL: postgresql://postgres:zowy3427@postgres:5432/taller_db
JWT_SECRET: tu-secreto-super-seguro-cambialo-en-produccion-12345  # ⚠️ CAMBIAR
JWT_EXPIRATION: 7d
```

#### Frontend:
```yaml
NEXT_PUBLIC_API_URL: http://localhost:3002
```

## 📝 Notas Importantes

### 🔴 Primer Inicio

En el **primer arranque**, el backend:
1. Espera a que PostgreSQL esté listo (healthcheck)
2. Ejecuta migraciones de Prisma automáticamente
3. Crea todas las tablas necesarias

**Tiempo estimado**: 1-2 minutos

### 💾 Persistencia de Datos

Los datos de PostgreSQL se guardan en un **volumen Docker** llamado `postgres_data`.

- ✅ Los datos persisten aunque detengas los contenedores
- ❌ Se borran si ejecutas `docker-compose down -v`

### 🔄 Reconstruir Imágenes

Si cambias código en backend o frontend:

```bash
# Reconstruir solo el servicio que cambió
docker-compose up --build backend

# O reconstruir todo
docker-compose up --build
```

### 🐛 Solución de Problemas

#### El backend no inicia
```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que PostgreSQL esté listo
docker-compose ps
```

#### Puerto ya en uso
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3002
netstat -ano | findstr :5432

# Matar el proceso (Windows)
taskkill /PID <número_de_pid> /F
```

#### Error de conexión a base de datos
```bash
# Reiniciar solo PostgreSQL
docker-compose restart postgres

# O eliminar todo y empezar de cero
docker-compose down -v
docker-compose up --build
```

## 🎯 Despliegue en Producción

### Cambios Recomendados:

1. **Cambiar credenciales de base de datos**
2. **Cambiar JWT_SECRET** a un valor aleatorio largo
3. **Cambiar NEXT_PUBLIC_API_URL** a tu dominio:
   ```yaml
   NEXT_PUBLIC_API_URL: https://api.tudominio.com
   ```
4. **Agregar SSL/TLS** con un reverse proxy (nginx, traefik)

### Ejemplo con Dominio Real:

```yaml
environment:
  NEXT_PUBLIC_API_URL: https://api.taller-sistema.com
```

## 📊 Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver uso de recursos
docker stats

# Acceder a un contenedor
docker exec -it taller_backend sh
docker exec -it taller_postgres psql -U postgres -d taller_db

# Limpiar todo Docker (¡CUIDADO!)
docker system prune -a --volumes
```

## 🏗️ Estructura de Archivos Docker

```
sistema_taller/
├── docker-compose.yml          # Orquestador principal
├── backend/
│   ├── Dockerfile             # Imagen del backend
│   └── .dockerignore          # Archivos a ignorar
├── frontend/
│   ├── Dockerfile             # Imagen del frontend
│   └── .dockerignore          # Archivos a ignorar
└── DOCKER.md                  # Esta documentación
```

## ✅ Checklist de Producción

- [ ] Cambiar password de PostgreSQL
- [ ] Cambiar JWT_SECRET
- [ ] Configurar dominio real en NEXT_PUBLIC_API_URL
- [ ] Configurar backup automático de base de datos
- [ ] Agregar monitoring (Prometheus, Grafana)
- [ ] Configurar reverse proxy con SSL
- [ ] Configurar límites de recursos (CPU, RAM)
- [ ] Configurar restart policies

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los contenedores estén corriendo: `docker-compose ps`
3. Intenta reiniciar: `docker-compose restart`
4. Como último recurso: `docker-compose down -v && docker-compose up --build`

---

**¡Tu sistema está listo para desplegarse en cualquier servidor con Docker! 🚀**
