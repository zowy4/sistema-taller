# 🚀 Sistema de Taller - Guía Completa

## ✅ Estado del Sistema: OPERATIVO

### 🌐 URLs del Sistema
- **Backend API**: http://localhost:3002
- **Frontend**: http://localhost:3001
- **Base de Datos**: PostgreSQL (host.docker.internal:5432)

---

## 📦 Módulos Implementados

### 1. **Autenticación y Usuarios** ✅
- Login/Logout con JWT
- Roles: Administrador, Supervisor, Técnico, Recepción
- Protección de rutas por rol
- **Credenciales de prueba**:
  - Admin: `admin@taller.com` / `password123`
  - Supervisor: `supervisor@taller.com` / `password123`
  - Técnico: `tecnico@taller.com` / `password123`

### 2. **Gestión de Inventario (Bidireccional)** ✅

#### Entrada de Inventario - Módulo COMPRAS
- **Backend**: 
  - `POST /compras` - Registrar compra (incrementa stock automáticamente)
  - `GET /compras` - Listar todas las compras
  - `GET /compras/:id` - Detalle de compra
  - `GET /compras/proveedor/:id` - Compras por proveedor
  - `DELETE /compras/:id` - Eliminar compra (revierte stock)
  
- **Frontend**:
  - `/admin/compras` - Lista de compras con filtros
  - `/admin/compras/new` - Formulario de compra (multi-repuesto)
  - `/admin/compras/:id` - Detalle de compra

#### Salida de Inventario - Módulo ÓRDENES
- **Backend**:
  - `POST /ordenes` - Crear orden (decrementa stock automáticamente)
  - `GET /ordenes` - Listar órdenes
  - `GET /ordenes/:id` - Detalle de orden
  - `DELETE /ordenes/:id` - Eliminar orden (revierte stock)

### 3. **Proveedores** ✅
- **Backend**:
  - `POST /proveedores` - Crear proveedor
  - `GET /proveedores` - Listar todos
  - `GET /proveedores/activos` - Solo activos
  - `GET /proveedores/:id` - Detalle con historial de compras
  - `PATCH /proveedores/:id/toggle-active` - Activar/Desactivar
  - `DELETE /proveedores/:id` - Eliminar

- **Frontend**:
  - `/admin/proveedores` - Lista con toggle activo/inactivo
  - `/admin/proveedores/new` - Formulario de registro

### 4. **Dashboard** ✅
- **Ubicación**: `/admin/dashboard`
- **KPIs en Tiempo Real**:
  - Total de repuestos en stock
  - Alertas de stock bajo
  - Total de proveedores activos
  - Órdenes de trabajo activas
  - Total de compras realizadas
- **Widgets**:
  - Top 5 alertas críticas de stock
  - Últimas 5 compras
  - Accesos rápidos (Nueva Compra, Nueva Orden, Reportes)

### 5. **Sistema de Alertas** ✅
- **Ubicación**: `/admin/alertas`
- **Tipos de Alertas**:
  - **Stock Bajo**: Repuestos debajo del mínimo con prioridad (CRÍTICO/URGENTE/BAJO)
  - **Proveedores Inactivos**: Lista de proveedores desactivados
  - **Órdenes Pendientes**: Trabajos en progreso
- **Filtros**: Todos, Stock, Proveedores, Órdenes
- **Cálculos Automáticos**: Déficit, costo de reposición

### 6. **Reportes y Análisis** ✅
- **Ubicación**: `/admin/reportes`
- **Tipos de Reportes**:

#### a) Rotación de Inventario
- Stock actual vs usado
- Ratio de rotación (color-coded)
- Valor total del stock
- Estado de cada repuesto

#### b) Compras por Proveedor
- Total de compras realizadas
- Monto total gastado
- Promedio por compra
- Última compra registrada

#### c) Rentabilidad de Servicios
- Análisis de órdenes completadas
- Costo de repuestos vs mano de obra
- Margen de ganancia porcentual
- Días de servicio

### 7. **Repuestos** ✅
- **Backend**:
  - `GET /repuestos` - Listar todos
  - `GET /repuestos/stock-bajo` - Filtrar stock bajo
  - `POST /repuestos` - Crear repuesto
  - `PATCH /repuestos/:id/ajustar-stock` - Ajuste manual

### 8. **Clientes y Vehículos** ✅
- Gestión completa de clientes
- Registro de vehículos por cliente
- Historial de servicios

### 9. **Facturas** ✅
- Generación de facturas desde órdenes
- Listado y detalle de facturas
- Estado de pago

---

## 🔒 Seguridad Implementada

### Autenticación JWT
- Todos los endpoints protegidos (excepto `/auth/login`)
- Token válido por 1 hora
- Refresh automático en frontend

### Control de Acceso por Rol
| Endpoint | Administrador | Supervisor | Técnico |
|----------|--------------|------------|---------|
| POST /compras | ✅ | ✅ | ❌ |
| GET /compras | ✅ | ✅ | ✅ |
| DELETE /compras | ✅ | ❌ | ❌ |
| POST /proveedores | ✅ | ✅ | ❌ |
| DELETE /proveedores | ✅ | ❌ | ❌ |
| POST /ordenes | ✅ | ✅ | ✅ |
| DELETE /ordenes | ✅ | ❌ | ❌ |

---

## 🔄 Transacciones Atómicas

### ¿Qué es una Transacción Atómica?
Todas las operaciones de compra y orden usan transacciones de Prisma para garantizar consistencia:

```typescript
// Si alguna operación falla, TODAS se revierten
prisma.$transaction(async (prisma) => {
  // 1. Crear compra
  // 2. Crear detalles (compras_repuestos)
  // 3. Incrementar stock de repuestos
  // Si falla el paso 3, se revierten 1 y 2
});
```

### Protecciones Implementadas
✅ Stock nunca puede ser negativo
✅ Validación de proveedor existente antes de compra
✅ Validación de repuestos existentes antes de cualquier operación
✅ Reversión automática de stock al eliminar compra/orden
✅ Errores específicos con códigos Prisma (P2002, P2025)

---

## 📊 Flujo de Inventario

```
┌─────────────────┐        ┌──────────────┐        ┌─────────────────┐
│ COMPRA          │        │ INVENTARIO   │        │ ORDEN           │
│ (Entrada)       │───────▶│              │◀───────│ (Salida)        │
│                 │  +50   │   Stock: 50  │  -3    │                 │
│ Proveedor: X    │        │              │        │ Cliente: Y      │
└─────────────────┘        └──────────────┘        └─────────────────┘
      │                           │                         │
      │                           │                         │
      ▼                           ▼                         ▼
  Incrementa                 Actualización            Decrementa
   Stock                      Automática               Stock
```

---

## 🎨 Interfaz de Usuario

### Características
✅ **Responsive Design**: Adaptable a móvil, tablet, desktop
✅ **Loading States**: Indicadores de carga en todas las operaciones
✅ **Error Handling**: Mensajes amigables y específicos
✅ **Color Coding**: 
- Verde: Estado positivo, activo, completado
- Rojo: Alertas, stock bajo, errores
- Amarillo: Pendiente, advertencias
- Azul: Información, links
✅ **TypeScript**: Tipado completo para seguridad de código
✅ **Real-time Calculations**: Totales, subtotales, márgenes

---

## 🚀 Cómo Usar el Sistema

### 1. **Iniciar Sesión**
```
1. Abrir http://localhost:3001
2. Usar credenciales: admin@taller.com / password123
3. Serás redirigido al dashboard
```

### 2. **Registrar una Compra**
```
1. Ir a Dashboard → "+ Nueva Compra"
   O ir a /admin/compras → "+ Nueva Compra"
2. Seleccionar proveedor
3. Agregar repuestos:
   - Seleccionar repuesto del dropdown
   - Ingresar cantidad
   - Ingresar precio unitario
   - Ver subtotal automático
4. Agregar más repuestos si es necesario (botón "+ Agregar Repuesto")
5. Ver total calculado automáticamente
6. Agregar notas (opcional)
7. Click en "Registrar Compra"
8. ✅ Stock se incrementa automáticamente
```

### 3. **Ver Alertas**
```
1. Ir a /admin/alertas
2. Ver alertas categorizadas:
   - Stock Bajo: Con prioridad y costo de reposición
   - Proveedores Inactivos: Para reactivar
   - Órdenes Pendientes: Para seguimiento
3. Filtrar por tipo de alerta
4. Click en cualquier ítem para ver detalles
```

### 4. **Generar Reportes**
```
1. Ir a /admin/reportes
2. Seleccionar tipo de reporte:
   - Rotación de Inventario
   - Compras por Proveedor
   - Rentabilidad de Servicios
3. Analizar datos en tablas con color-coding
4. Exportar (función en desarrollo)
```

### 5. **Gestionar Proveedores**
```
1. Ir a /admin/proveedores
2. Ver lista con conteo de compras
3. Toggle activo/inactivo con un click
4. Crear nuevo proveedor con formulario validado
5. Ver historial de compras por proveedor
```

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **NestJS 10**: Framework modular
- **Prisma 5.22**: ORM con migraciones
- **PostgreSQL**: Base de datos relacional
- **Passport JWT**: Autenticación
- **Class Validator**: Validación de DTOs
- **TypeScript**: Tipado estático

### Frontend
- **Next.js 16**: App Router
- **React 19**: Componentes
- **TypeScript**: Tipado completo
- **Tailwind CSS**: Estilos utility-first
- **Fetch API**: Comunicación HTTP

### DevOps
- **Docker**: Contenedor PostgreSQL
- **Docker Compose**: Orquestación
- **NPM Scripts**: Automatización

---

## 📝 Comandos Útiles

### Iniciar Sistema Completo
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Base de Datos
```bash
# Crear migración
cd backend
npx prisma migrate dev --name nombre_migracion

# Aplicar migración
npx prisma migrate deploy

# Regenerar Prisma Client
npx prisma generate

# Seed (datos de prueba)
npx prisma db seed
```

### Ver Logs
```bash
# Backend logs: En terminal donde corre npm run start:dev
# Frontend logs: En terminal donde corre npm run dev
# Database logs: En Docker Desktop o docker logs postgres_taller
```

---

## 🐛 Troubleshooting

### Error: Port 3002 already in use
```bash
# Windows
Get-NetTCPConnection -LocalPort 3002 | Select OwningProcess
Stop-Process -Id <PID> -Force
```

### Error: Database connection failed
```bash
# Verificar Docker
docker ps

# Reiniciar contenedor
docker restart postgres_taller
```

### Error: Frontend can't reach backend
```bash
# Verificar .env.local en frontend
NEXT_PUBLIC_API_URL=http://localhost:3002

# Reiniciar frontend
cd frontend
npm run dev
```

---

## 📚 Documentación Adicional

- **COMPRAS_GUIA_COMPLETA.md**: Guía detallada del módulo de compras
- **ORDENES_GUIA.md**: Guía del módulo de órdenes
- **DOCKER_README.md**: Configuración de Docker
- **postman_collection_ordenes.json**: Collection de Postman para testing

---

## 🎯 Próximas Mejoras Sugeridas

### Funcionalidades
- [ ] Exportación de reportes a PDF/Excel
- [ ] Gráficos interactivos (Chart.js o Recharts)
- [ ] Notificaciones push para alertas críticas
- [ ] Historial de cambios (audit log)
- [ ] Búsqueda avanzada con filtros
- [ ] Paginación en listados grandes
- [ ] Caché de datos frecuentes (Redis)

### Seguridad
- [ ] Rate limiting en API
- [ ] Refresh tokens
- [ ] 2FA opcional
- [ ] Logs de acceso

### UX/UI
- [ ] Dark mode
- [ ] Tour guiado para nuevos usuarios
- [ ] Shortcuts de teclado
- [ ] Drag & drop para reordenar

---

## 👥 Roles y Permisos

### Administrador
- Acceso total al sistema
- Puede crear/editar/eliminar todo
- Gestiona empleados y configuración

### Supervisor
- Puede crear compras y órdenes
- Puede ver todos los reportes
- No puede eliminar compras/órdenes
- No puede gestionar empleados

### Técnico
- Puede ver compras, proveedores, repuestos
- Puede crear órdenes de trabajo
- No puede gestionar proveedores ni compras
- Acceso limitado a reportes

### Recepción
- Puede ver clientes y vehículos
- Puede crear órdenes
- No puede ver costos ni compras
- Acceso limitado

---

## 📞 Soporte

Para problemas o preguntas:
1. Revisar esta guía completa
2. Revisar documentación específica de módulos
3. Verificar logs de backend y frontend
4. Revisar estado de base de datos

---

## ✅ Checklist de Verificación

### Inicio del Sistema
- [ ] Docker Desktop corriendo
- [ ] Contenedor `postgres_taller` activo
- [ ] Backend iniciado en puerto 3002
- [ ] Frontend iniciado en puerto 3001
- [ ] Login exitoso
- [ ] Dashboard muestra datos

### Funcionalidades Clave
- [ ] Crear nueva compra incrementa stock
- [ ] Crear orden decrementa stock
- [ ] Alertas muestran stock bajo
- [ ] Reportes cargan correctamente
- [ ] Proveedores se pueden activar/desactivar
- [ ] Dashboard muestra KPIs actualizados

---

**Sistema Completo y Operativo** ✅
**Fecha de Implementación**: 15 de Noviembre, 2025
**Versión**: 1.0.0
