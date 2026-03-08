# Sistema de Gestión de Taller

Sistema completo para gestión de taller mecánico con NestJS (backend) y Next.js (frontend).

## 🏗️ Arquitectura C4

- Ver diagramas C4 (Niveles 1, 2 y 3): [docs/C4_ARCHITECTURE.md](docs/C4_ARCHITECTURE.md)

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- PostgreSQL
- Docker (para la base de datos)

### Configuración Inicial

1. **Instalar dependencias**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Configurar base de datos**
```bash
# En la carpeta raíz, asegúrate de tener Docker corriendo
# La base de datos PostgreSQL debe estar configurada
```

3. **Variables de entorno**
Crea un archivo `.env` en la carpeta `backend` con:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/taller_db"
JWT_SECRET="tu-secreto-jwt"
PORT=3002
```

## 🏃 Ejecutar el Sistema

### Opción 1: Iniciar servicios por separado (RECOMENDADO)

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```
Espera a ver: `✅ Backend is running on: http://localhost:3002`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Espera a ver: `✓ Ready in XXXXms`

**Navegador:**
Abre: `http://localhost:3000`

### Opción 2: Iniciar ambos servicios con concurrently

```bash
# Desde la carpeta raíz
npm run dev
```

⚠️ **IMPORTANTE:**
- NO cierres las terminales donde corren los servicios
- NO presiones Ctrl+C en esas terminales
- Mantén ambas terminales abiertas mientras uses el sistema

## 📦 Módulos Implementados

### Backend (NestJS)
- ✅ **Autenticación y Autorización** (JWT, roles)
- ✅ **Clientes** (CRUD completo)
- ✅ **Vehículos** (gestión por cliente)
- ✅ **Servicios** (catálogo de servicios)
- ✅ **Repuestos** (inventario con alertas de stock)
- ✅ **Órdenes de Trabajo** (gestión completa)
- ✅ **Facturación** (generación automática)
- ✅ **Empleados** (gestión de personal)
- ✅ **Proveedores** (CRUD con soft delete)
- ✅ **Compras** (registro con actualización automática de stock)
- ✅ **Dashboard** (KPIs y estadísticas)

### Frontend (Next.js 16)
- ✅ **Dashboard** (visualización de KPIs)
- ✅ **Gestión de Clientes**
- ✅ **Gestión de Vehículos**
- ✅ **Gestión de Servicios**
- ✅ **Inventario de Repuestos** (con alertas)
- ✅ **Órdenes de Trabajo** (creación y seguimiento)
- ✅ **Facturación**
- ✅ **Gestión de Proveedores** (lista con filtros)
- ✅ **Compras** (interfaz POS style con carrito)

## 🔑 Características Principales

### Gestión de Compras y Proveedores
- **Proveedores:**
  - CRUD completo con soft delete
  - Filtros: todos, activos, inactivos
  - Contador de compras por proveedor
  
- **Compras:**
  - Interfaz estilo POS con carrito de compras
  - Selección de proveedor
  - Búsqueda de repuestos por código o nombre
  - Actualización automática de `stock_actual` al registrar compra
  - Registro de `precio_compra` por repuesto
  - Transacciones seguras (integridad de datos)

### Inventario Inteligente
- Alertas automáticas de stock bajo
- Visualización en dashboard
- Código de producto único
- Precio de compra y venta separados

## 🗄️ Estructura de Base de Datos

### Tablas Principales
- `Clientes`
- `Vehiculos`
- `Servicios`
- `Repuestos` (con `stock_actual`, `stock_minimo`, `precio_compra`, `precio_venta`, `codigo`)
- `OrdenesDeTrabajo`
- `Facturas`
- `Empleados`
- `Proveedores` (con campo `activo`)
- `Compras` (con relación a proveedores y repuestos)
- `CompraRepuesto` (detalles de compra)

## 📡 API Endpoints Principales

### Proveedores
```
GET    /proveedores           # Listar todos
GET    /proveedores/activos   # Solo activos
GET    /proveedores/:id       # Ver uno
POST   /proveedores           # Crear
PATCH  /proveedores/:id       # Actualizar
DELETE /proveedores/:id       # Desactivar (soft)
PATCH  /proveedores/:id/toggle-active  # Activar/desactivar
```

### Compras
```
GET    /compras                       # Listar todas
GET    /compras/:id                   # Ver una
GET    /compras/proveedor/:id         # Por proveedor
POST   /compras                       # Crear (actualiza stock)
PATCH  /compras/:id                   # Actualizar
DELETE /compras/:id                   # Eliminar
```

## 🔧 Tecnologías Utilizadas

### Backend
- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Class Validator

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Chart.js (gráficos)
- Turbopack (dev server)

## 📝 Notas de Desarrollo

### Cambios Recientes en el Schema
- `Repuestos.cantidad_existente` → `stock_actual`
- `Repuestos.nivel_minimo_alerta` → `stock_minimo`
- `Repuestos.precio_unitario` → `precio_venta`
- Agregado `Repuestos.codigo` (único)
- Agregado `Repuestos.precio_compra`
- `Servicios.precio_estandar` → `precio`

### Sincronización de Schema
Si modificas la base de datos directamente:
```bash
cd backend
npx prisma db pull
npx prisma generate
```

## 🐛 Solución de Problemas

### Error: "listen EADDRINUSE: address already in use"
```bash
# Detener todos los procesos Node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Verificar que los puertos estén libres
Get-NetTCPConnection -LocalPort 3000,3002 -State Listen -ErrorAction SilentlyContinue
```

### Frontend no responde
1. Verifica que el backend esté corriendo primero
2. Asegúrate de que el puerto 3000 esté libre
3. Revisa la terminal del frontend por errores
4. Intenta acceder directamente a: `http://localhost:3000`

## 📄 Licencia

Este proyecto es privado y está bajo desarrollo.
