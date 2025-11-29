# 🚗 Portal del Cliente - Especificación Técnica

## 📋 Contexto del Negocio

El **Portal del Cliente** permite que los dueños de vehículos accedan a información de sus autos y servicios sin necesidad de contactar al taller telefónicamente.

### 🎯 Objetivos del Portal

1. **Reducir llamadas telefónicas** - Clientes consultan estado de reparaciones online
2. **Transparencia total** - Historial completo de servicios y costos
3. **Confianza del cliente** - Acceso 24/7 a información de sus vehículos
4. **Eficiencia operativa** - Menos tiempo del personal en consultas

---

## 🏗️ Arquitectura Propuesta

### Rutas del Portal

```
/portal                          # Landing page pública
├── /portal/login               # Login específico para clientes
├── /portal/register            # Registro de cuenta (requiere validación)
├── /portal/dashboard           # Dashboard del cliente autenticado
│   ├── /portal/mis-vehiculos   # Lista de vehículos registrados
│   ├── /portal/ordenes         # Órdenes de trabajo (historial + activas)
│   ├── /portal/facturas        # Facturas pagadas y pendientes
│   └── /portal/perfil          # Editar datos de contacto
```

### Base de Datos (Prisma Schema)

```prisma
// Ya existente
model Cliente {
  id_cliente      Int       @id @default(autoincrement())
  nombre          String
  apellido        String
  email           String    @unique
  telefono        String
  direccion       String?
  activo          Boolean   @default(true)
  fecha_registro  DateTime  @default(now())
  
  // 🆕 NUEVO: Campos para acceso al portal
  password_hash   String?   // Hash bcrypt del password
  email_verificado Boolean  @default(false)
  token_verificacion String? // Token para verificar email
  ultimo_acceso   DateTime?
  
  // Relaciones existentes
  vehiculos       Vehiculo[]
  ordenes         Orden[]
  
  @@map("clientes")
}

model Vehiculo {
  id_vehiculo     Int       @id @default(autoincrement())
  id_cliente      Int
  marca           String
  modelo          String
  anio            Int
  patente         String    @unique
  vin             String?
  color           String?
  kilometraje     Int?
  tipo_combustible String?
  activo          Boolean   @default(true)
  fecha_registro  DateTime  @default(now())
  
  // 🆕 NUEVO: Foto del vehículo
  foto_url        String?   // URL de S3/Cloudinary
  
  cliente         Cliente   @relation(fields: [id_cliente], references: [id_cliente])
  ordenes         Orden[]
  
  @@map("vehiculos")
}

model Orden {
  id_orden            Int       @id @default(autoincrement())
  id_cliente          Int
  id_vehiculo         Int
  id_empleado_asignado Int?
  fecha_ingreso       DateTime  @default(now())
  fecha_estimada      DateTime?
  fecha_entrega       DateTime?
  estado              EstadoOrden @default(pendiente)
  descripcion_problema String    @db.Text
  observaciones       String?   @db.Text
  costo_mano_obra     Decimal   @default(0)
  costo_repuestos     Decimal   @default(0)
  total               Decimal   @default(0)
  
  // 🆕 NUEVO: Campos para tracking del cliente
  visible_cliente  Boolean   @default(true)  // Admin puede ocultar órdenes
  notas_internas   String?   @db.Text        // No visibles para cliente
  
  cliente          Cliente   @relation(fields: [id_cliente], references: [id_cliente])
  vehiculo         Vehiculo  @relation(fields: [id_vehiculo], references: [id_vehiculo])
  empleado         Empleado? @relation(fields: [id_empleado_asignado], references: [id_empleado])
  factura          Factura?
  repuestos_usados OrdenRepuesto[]
  
  @@map("ordenes")
}

enum EstadoOrden {
  pendiente
  en_proceso
  esperando_repuestos
  completada
  entregada
  cancelada
}
```

---

## 🔐 Sistema de Autenticación

### Flujo de Registro

```
1. Cliente ingresa email en /portal/register
2. Sistema busca si email existe en tabla `clientes`
3. Si existe:
   - Envía email con link de activación
   - Link contiene token único (JWT)
4. Cliente hace clic en link
5. Sistema muestra formulario para crear password
6. Password se guarda como hash bcrypt
7. Email se marca como verificado
8. Cliente puede hacer login
```

### Flujo de Login

```
1. Cliente ingresa email + password en /portal/login
2. Sistema verifica credenciales
3. Si correctas:
   - Genera JWT con payload: { id_cliente, email, tipo: 'cliente' }
   - Frontend guarda token en localStorage
   - Redirect a /portal/dashboard
4. Si incorrectas:
   - Toast error "Credenciales inválidas"
```

### Middleware de Protección

```typescript
// backend/src/portal/guards/portal-auth.guard.ts
@Injectable()
export class PortalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Solo permitir acceso si es cliente (no admin/empleado)
    return user && user.tipo === 'cliente';
  }
}
```

---

## 📱 Páginas del Portal (Frontend)

### 1. `/portal/dashboard` - Dashboard Principal

**Componentes:**
```
┌─────────────────────────────────────────┐
│ Bienvenido, Juan Pérez             [🔔] │
├─────────────────────────────────────────┤
│                                          │
│  🚗 Mis Vehículos                       │
│  ┌──────────────┬──────────────┐       │
│  │ Toyota Corolla│ Honda Civic │       │
│  │ ABC-123       │ XYZ-789     │       │
│  │ ✅ Al día     │ ⚠️ En taller│       │
│  └──────────────┴──────────────┘       │
│                                          │
│  📋 Órdenes Activas (2)                │
│  ┌───────────────────────────────────┐ │
│  │ Orden #145 - Toyota Corolla       │ │
│  │ Estado: En Proceso (60%)          │ │
│  │ Estimado: 22 Nov 2025             │ │
│  └───────────────────────────────────┘ │
│                                          │
│  💰 Facturas Pendientes (1)           │
│  ┌───────────────────────────────────┐ │
│  │ Factura #88 - $250.00             │ │
│  │ Vence: 25 Nov 2025  [Pagar]      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Queries:**
```typescript
const { data: vehiculos } = useQuery({
  queryKey: ['portal-mis-vehiculos'],
  queryFn: () => fetchMisVehiculos(token!),
});

const { data: ordenesActivas } = useQuery({
  queryKey: ['portal-ordenes-activas'],
  queryFn: () => fetchOrdenesActivas(token!),
});

const { data: facturasPendientes } = useQuery({
  queryKey: ['portal-facturas-pendientes'],
  queryFn: () => fetchFacturasPendientes(token!),
});
```

---

### 2. `/portal/mis-vehiculos` - Lista de Vehículos

**Componentes:**
```
┌─────────────────────────────────────────┐
│ 🚗 Mis Vehículos              [+ Agregar]│
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐  │
│  │ [Foto]  Toyota Corolla 2020      │  │
│  │         Patente: ABC-123         │  │
│  │         Kilometraje: 45,000 km   │  │
│  │                                   │  │
│  │  📋 3 órdenes completadas        │  │
│  │  💰 Total gastado: $1,250.00     │  │
│  │                                   │  │
│  │  [Ver Historial] [Ver Detalle]   │  │
│  └──────────────────────────────────┘  │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │ [Foto]  Honda Civic 2018         │  │
│  │         Patente: XYZ-789         │  │
│  │         ⚠️ EN TALLER             │  │
│  │                                   │  │
│  │  Orden #145: Cambio de aceite    │  │
│  │  Estado: En Proceso (60%)        │  │
│  │  Estimado: 22 Nov 2025           │  │
│  │                                   │  │
│  │  [Ver Orden Activa]              │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### 3. `/portal/ordenes` - Historial de Órdenes

**Componentes:**
```
┌─────────────────────────────────────────┐
│ 📋 Historial de Órdenes                │
│ [Todas] [Activas] [Completadas]        │
├─────────────────────────────────────────┤
│                                          │
│  Orden #145 - Toyota Corolla ABC-123   │
│  ┌───────────────────────────────────┐ │
│  │ Estado: En Proceso                │ │
│  │ Ingreso: 20 Nov 2025              │ │
│  │ Estimado: 22 Nov 2025             │ │
│  │                                    │ │
│  │ Descripción:                       │ │
│  │ "Cambio de aceite y filtros"      │ │
│  │                                    │ │
│  │ Repuestos:                         │ │
│  │ • Aceite 5W-30 (4 litros) - $40  │ │
│  │ • Filtro de aceite - $15          │ │
│  │                                    │ │
│  │ Mano de obra: $80                 │ │
│  │ Total: $135.00                    │ │
│  │                                    │ │
│  │ Mecánico: Carlos López            │ │
│  │                                    │ │
│  │ [Ver Factura] [Descargar PDF]    │ │
│  └───────────────────────────────────┘ │
│                                          │
│  Orden #120 - Honda Civic XYZ-789     │
│  ┌───────────────────────────────────┐ │
│  │ Estado: ✅ Completada              │ │
│  │ Fecha: 10 Nov 2025                │ │
│  │ Total: $320.00                    │ │
│  │ [Ver Detalles]                    │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 4. `/portal/facturas` - Facturas

**Componentes:**
```
┌─────────────────────────────────────────┐
│ 💰 Mis Facturas                         │
│ [Pendientes] [Pagadas] [Todas]          │
├─────────────────────────────────────────┤
│                                          │
│  ⚠️ Pendiente de Pago                   │
│  ┌───────────────────────────────────┐ │
│  │ Factura #88                       │ │
│  │ Orden #145 - Toyota Corolla       │ │
│  │                                    │ │
│  │ Monto: $135.00                    │ │
│  │ Vence: 25 Nov 2025                │ │
│  │                                    │ │
│  │ [💳 Pagar Ahora] [Ver PDF]        │ │
│  └───────────────────────────────────┘ │
│                                          │
│  ✅ Pagadas                             │
│  ┌───────────────────────────────────┐ │
│  │ Factura #75 - $320.00             │ │
│  │ Pagada: 10 Nov 2025               │ │
│  │ [Descargar PDF]                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔧 Servicios API del Portal

### Backend Endpoints

```typescript
// backend/src/portal/portal.controller.ts

@Controller('portal')
@UseGuards(PortalAuthGuard)
export class PortalController {
  
  // Dashboard
  @Get('dashboard/summary')
  async getDashboardSummary(@Req() req) {
    const clienteId = req.user.id_cliente;
    return {
      vehiculos_count: 2,
      ordenes_activas: 1,
      facturas_pendientes: 1,
      ultimo_servicio: '10 Nov 2025',
    };
  }
  
  // Vehículos
  @Get('vehiculos')
  async getMisVehiculos(@Req() req) {
    const clienteId = req.user.id_cliente;
    return this.portalService.findVehiculosByCliente(clienteId);
  }
  
  @Get('vehiculos/:id/historial')
  async getHistorialVehiculo(@Param('id') id: number, @Req() req) {
    // Verificar que el vehículo pertenezca al cliente
    return this.portalService.getHistorialVehiculo(id, req.user.id_cliente);
  }
  
  // Órdenes
  @Get('ordenes')
  async getMisOrdenes(
    @Query('estado') estado?: string,
    @Req() req?,
  ) {
    const clienteId = req.user.id_cliente;
    return this.portalService.findOrdenesByCliente(clienteId, estado);
  }
  
  @Get('ordenes/:id')
  async getDetalleOrden(@Param('id') id: number, @Req() req) {
    // Verificar que la orden pertenezca al cliente
    return this.portalService.getDetalleOrden(id, req.user.id_cliente);
  }
  
  // Facturas
  @Get('facturas')
  async getMisFacturas(
    @Query('estado_pago') estadoPago?: string,
    @Req() req?,
  ) {
    const clienteId = req.user.id_cliente;
    return this.portalService.findFacturasByCliente(clienteId, estadoPago);
  }
  
  @Get('facturas/:id/pdf')
  async descargarFacturaPDF(@Param('id') id: number, @Req() req, @Res() res) {
    const pdf = await this.portalService.generarFacturaPDF(id, req.user.id_cliente);
    res.set('Content-Type', 'application/pdf');
    res.send(pdf);
  }
  
  // Perfil
  @Get('perfil')
  async getMiPerfil(@Req() req) {
    return this.portalService.getClientePerfil(req.user.id_cliente);
  }
  
  @Patch('perfil')
  async actualizarPerfil(@Body() dto: UpdatePerfilDto, @Req() req) {
    return this.portalService.updatePerfil(req.user.id_cliente, dto);
  }
}
```

---

## 🎨 Diseño UI/UX

### Paleta de Colores del Portal

```css
/* Diferente del admin para distinguir visualmente */
:root {
  --portal-primary: #2563eb;    /* Azul más brillante */
  --portal-success: #10b981;    /* Verde esmeralda */
  --portal-warning: #f59e0b;    /* Naranja */
  --portal-danger: #ef4444;     /* Rojo */
  --portal-gray: #6b7280;       /* Gris neutro */
  --portal-bg: #f9fafb;         /* Fondo suave */
}
```

### Componentes Reutilizables

```typescript
// frontend/src/components/portal/VehicleCard.tsx
export function VehicleCard({ vehiculo }: { vehiculo: Vehiculo }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <img src={vehiculo.foto_url} className="w-full h-32 object-cover rounded" />
      <h3 className="font-semibold mt-2">{vehiculo.marca} {vehiculo.modelo}</h3>
      <p className="text-sm text-gray-600">Patente: {vehiculo.patente}</p>
      {vehiculo.orden_activa && (
        <div className="mt-2 p-2 bg-yellow-50 rounded">
          <p className="text-sm">⚠️ En taller</p>
        </div>
      )}
    </div>
  );
}

// frontend/src/components/portal/OrdenCard.tsx
export function OrdenCard({ orden }: { orden: Orden }) {
  const estadoColor = {
    pendiente: 'bg-gray-100 text-gray-800',
    en_proceso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">Orden #{orden.id_orden}</h3>
          <p className="text-sm text-gray-600">{orden.vehiculo.marca} {orden.vehiculo.modelo}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${estadoColor[orden.estado]}`}>
          {orden.estado.toUpperCase()}
        </span>
      </div>
      <p className="text-sm mt-2">{orden.descripcion_problema}</p>
      <div className="flex justify-between items-center mt-4">
        <p className="text-lg font-bold">${orden.total.toFixed(2)}</p>
        <Link href={`/portal/ordenes/${orden.id_orden}`}>
          <button className="text-blue-600 text-sm hover:underline">
            Ver detalles →
          </button>
        </Link>
      </div>
    </div>
  );
}
```

---

## 🚀 Plan de Implementación

### Fase 1: Backend (2-3 días)
- [ ] Migración Prisma: Agregar campos de autenticación a `Cliente`
- [ ] Módulo `portal` en NestJS
- [ ] Endpoints CRUD para dashboard, vehículos, órdenes, facturas
- [ ] Guard de autenticación específico para portal
- [ ] Servicio de emails (verificación de cuenta)

### Fase 2: Frontend (3-4 días)
- [ ] Layouts para portal (diferente del admin)
- [ ] Páginas: Login, Register, Dashboard
- [ ] Páginas: Mis Vehículos, Órdenes, Facturas, Perfil
- [ ] Servicios API (`portal.service.ts`)
- [ ] Custom hooks (`usePortalAuth`, `usePortalData`)

### Fase 3: Features Avanzadas (opcional)
- [ ] Notificaciones push (cuando cambia estado de orden)
- [ ] Chat en vivo con el taller
- [ ] Citas online (agendar servicios)
- [ ] Pagos online (Stripe/MercadoPago)

---

## 🎯 Métricas de Éxito

- **Reducción de llamadas:** -60% de consultas telefónicas
- **Satisfacción del cliente:** +40% en encuestas
- **Adopción:** 70% de clientes registrados en 6 meses
- **Eficiencia:** -30% de tiempo del personal en consultas

---

## 🔐 Seguridad

1. **JWT Tokens:** Expiración de 7 días, refresh tokens
2. **Rate Limiting:** Máx 100 requests/min por IP
3. **Validación de Ownership:** Cliente solo ve SUS vehículos/órdenes
4. **Ocultación de datos sensibles:** Notas internas del mecánico no visibles
5. **HTTPS obligatorio:** No funciona en HTTP
6. **CORS restrictivo:** Solo desde dominio del portal

---

## 📚 Stack Tecnológico

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 16 + Tanstack Query + Sonner
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer / SendGrid
- **PDF:** PDFKit / Puppeteer
- **Hosting:** Vercel (frontend) + Railway/Fly.io (backend)

---

## 🎉 Resultado Final

Un portal moderno que:
- ✅ Reduce carga operativa del taller
- ✅ Aumenta satisfacción del cliente
- ✅ Genera confianza y transparencia
- ✅ Diferenciador competitivo en el mercado

**¡Volvemos al negocio con tecnología de punta!** 🚀
