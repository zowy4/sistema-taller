# 🎉 Sistema Taller - Contenerización Completa

## ✅ Implementación Finalizada

Tu sistema está **completamente dockerizado** y listo para desplegar en cualquier servidor.

---

## 📦 Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   DOCKER HOST                       │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  PostgreSQL  │  │   Backend    │  │ Frontend │ │
│  │   (DB)       │◄─│   NestJS     │◄─│ Next.js  │ │
│  │              │  │              │  │          │ │
│  │  Port: 5432  │  │  Port: 3002  │  │Port: 3000│ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│         ▲                  ▲                ▲      │
│         │                  │                │      │
│         └──────────────────┴────────────────┘      │
│              Red Docker: taller_network            │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Inicio Rápido (3 pasos)

### 1. Asegúrate de tener Docker instalado
```bash
docker --version
docker-compose --version
```

### 2. Opción A - Con Script Helper (Recomendado)
```powershell
# Windows
.\docker-helper.ps1
```

```bash
# Linux/Mac
chmod +x docker-helper.sh
./docker-helper.sh
```

### 2. Opción B - Manual
```bash
docker-compose up --build
```

### 3. Abre tu navegador
```
http://localhost:3000
```

---

## 📁 Archivos Docker Creados

| Archivo | Descripción |
|---------|-------------|
| `backend/Dockerfile` | Imagen multi-stage del backend NestJS |
| `frontend/Dockerfile` | Imagen multi-stage del frontend Next.js |
| `docker-compose.yml` | Orquestador de los 3 servicios |
| `backend/.dockerignore` | Archivos a excluir del build backend |
| `frontend/.dockerignore` | Archivos a excluir del build frontend |
| `DOCKER.md` | Documentación completa de Docker |
| `docker-helper.ps1` | Script de utilidades Windows |
| `docker-helper.sh` | Script de utilidades Unix/Mac |
| `backend/.env.example` | Plantilla de variables backend |
| `frontend/.env.example` | Plantilla de variables frontend |

---

## ⚙️ Configuración Actual

### PostgreSQL
- **Usuario**: postgres
- **Contraseña**: zowy3427
- **Base de datos**: taller_db
- **Puerto**: 5432

### Backend
- **Puerto**: 3002
- **JWT Secret**: (cambiar en producción)
- **Migraciones**: Automáticas al iniciar

### Frontend
- **Puerto**: 3000
- **API URL**: http://localhost:3002

---

## 🎯 Comandos Útiles

### Gestión Básica
```bash
# Iniciar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Detener
docker-compose down

# Detener y limpiar datos
docker-compose down -v
```

### Desarrollo
```bash
# Reconstruir solo backend
docker-compose up --build backend

# Reconstruir solo frontend
docker-compose up --build frontend

# Ver logs del backend
docker-compose logs -f backend

# Reiniciar un servicio
docker-compose restart backend
```

### Base de Datos
```bash
# Acceder a PostgreSQL CLI
docker exec -it taller_postgres psql -U postgres -d taller_db

# Hacer backup
docker exec taller_postgres pg_dump -U postgres taller_db > backup.sql

# Restaurar backup
docker exec -i taller_postgres psql -U postgres -d taller_db < backup.sql
```

---

## ✨ Características Implementadas

✅ **Multi-stage builds** - Imágenes optimizadas y ligeras  
✅ **Health checks** - Monitoreo automático de servicios  
✅ **Volumes persistentes** - Los datos no se pierden al reiniciar  
✅ **Red aislada** - Comunicación segura entre contenedores  
✅ **Variables de entorno** - Configuración flexible  
✅ **Migraciones automáticas** - Prisma ejecuta migraciones al iniciar  
✅ **Standalone output** - Next.js optimizado para producción  
✅ **Restart policies** - Los contenedores se reinician automáticamente  

---

## 🔒 Seguridad para Producción

### ⚠️ CAMBIAR ANTES DE DESPLEGAR:

1. **Password de PostgreSQL**
   ```yaml
   POSTGRES_PASSWORD: tu_password_super_seguro
   ```

2. **JWT Secret**
   ```yaml
   JWT_SECRET: genera_un_secreto_aleatorio_largo_y_seguro
   ```

3. **API URL del Frontend**
   ```yaml
   NEXT_PUBLIC_API_URL: https://api.tudominio.com
   ```

4. **Desactivar puertos expuestos** (opcional)
   - Comentar el mapeo de puerto de PostgreSQL si no necesitas acceso externo

---

## 📊 Verificación del Sistema

Después de iniciar, verifica que todo funciona:

1. ✅ **PostgreSQL**
   ```bash
   docker-compose ps postgres
   # Debe mostrar: Up (healthy)
   ```

2. ✅ **Backend**
   ```bash
   curl http://localhost:3002
   # Debe responder
   ```

3. ✅ **Frontend**
   ```bash
   curl http://localhost:3000
   # Debe responder con HTML
   ```

4. ✅ **Logs sin errores**
   ```bash
   docker-compose logs
   # Busca mensajes de "Application is running"
   ```

---

## 🐛 Solución de Problemas

### Puerto ya en uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Backend no conecta a DB
```bash
# Verificar que PostgreSQL esté listo
docker-compose logs postgres

# Reiniciar backend
docker-compose restart backend
```

### Limpiar y empezar de cero
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## 🚢 Despliegue en Producción

### Opciones de Hosting:

1. **VPS (DigitalOcean, AWS EC2, etc.)**
   - Instalar Docker
   - Clonar repositorio
   - Configurar variables de entorno
   - Ejecutar `docker-compose up -d`

2. **Servicios Gestionados**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances

3. **Plataformas Docker**
   - Railway.app
   - Render.com
   - Fly.io

---

## 📚 Documentación Adicional

- **DOCKER.md** - Guía completa de Docker con ejemplos
- **backend/.env.example** - Variables de entorno del backend
- **frontend/.env.example** - Variables de entorno del frontend
- **docker-helper.ps1** - Script interactivo de gestión

---

## 🎓 Lo que Aprendiste

✅ Dockerización de aplicaciones full-stack  
✅ Multi-stage builds para optimización  
✅ Docker Compose para orquestación  
✅ Networking entre contenedores  
✅ Persistencia de datos con volumes  
✅ Health checks y dependencias  
✅ Variables de entorno en contenedores  
✅ Buenas prácticas de seguridad  

---

## 🎉 ¡Felicitaciones!

Tu sistema está **production-ready** y puede desplegarse en cualquier servidor con Docker en **menos de 5 minutos**.

```bash
# Un solo comando para desplegar todo:
docker-compose up -d
```

**¡Listo para producción! 🚀**
