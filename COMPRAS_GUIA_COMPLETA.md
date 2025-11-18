# 📦 Sistema de Gestión de Inventario Completo

## 🔄 Flujo Bidireccional de Inventario

### ENTRADA (Compras a Proveedores) ➡️ STOCK AUMENTA
### SALIDA (Órdenes de Trabajo) ➡️ STOCK DISMINUYE

---

## 📥 MÓDULO DE COMPRAS - Entrada de Inventario

### 1️⃣ Gestión de Proveedores

#### **Crear Proveedor**
```http
POST http://localhost:3002/proveedores
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nombre": "AutoPartes Premium",
  "empresa": "AutoPartes Premium SA",
  "telefono": "+1234567890",
  "email": "ventas@autopartespremium.com",
  "direccion": "Av. Industrial 456",
  "activo": true
}
```

#### **Listar Proveedores**
```http
GET http://localhost:3002/proveedores
Authorization: Bearer {{token}}
```

#### **Listar Solo Proveedores Activos**
```http
GET http://localhost:3002/proveedores/activos
Authorization: Bearer {{token}}
```

#### **Ver Proveedor con su Historial de Compras**
```http
GET http://localhost:3002/proveedores/1
Authorization: Bearer {{token}}
```

**Respuesta:**
```json
{
  "id_proveedor": 1,
  "nombre": "AutoPartes SA",
  "empresa": "AutoPartes Sociedad Anónima",
  "telefono": "+1234567890",
  "email": "ventas@autopartes.com",
  "direccion": "Calle Principal 123",
  "activo": true,
  "compras": [
    {
      "id_compra": 1,
      "fecha_compra": "2025-11-15T...",
      "total": 3500,
      "estado": "completada",
      "compras_repuestos": [...]
    }
  ]
}
```

#### **Actualizar Proveedor**
```http
PATCH http://localhost:3002/proveedores/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "telefono": "+9876543210",
  "direccion": "Nueva dirección"
}
```

#### **Activar/Desactivar Proveedor**
```http
PATCH http://localhost:3002/proveedores/1/toggle-active
Authorization: Bearer {{token}}
```

#### **Eliminar Proveedor** (Solo Administradores)
```http
DELETE http://localhost:3002/proveedores/1
Authorization: Bearer {{token}}
```

---

### 2️⃣ Registro de Compras (AUMENTA EL STOCK)

#### **Crear Compra a Proveedor**
```http
POST http://localhost:3002/compras
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id_proveedor": 1,
  "total": 3500,
  "estado": "completada",
  "notas": "Compra de repuestos para el mes de noviembre",
  "repuestos": [
    {
      "id_repuesto": 1,
      "cantidad": 50,
      "precio_unitario": 30
    },
    {
      "id_repuesto": 2,
      "cantidad": 20,
      "precio_unitario": 120
    },
    {
      "id_repuesto": 3,
      "cantidad": 30,
      "precio_unitario": 15
    }
  ]
}
```

**¿Qué hace esta petición?**
1. ✅ Crea una orden de compra al proveedor
2. ✅ Registra todos los repuestos comprados
3. ✅ **INCREMENTA automáticamente el stock:**
   - Repuesto ID 1: +50 unidades
   - Repuesto ID 2: +20 unidades
   - Repuesto ID 3: +30 unidades
4. ✅ Todo en una transacción atómica

**Respuesta Exitosa (201 Created):**
```json
{
  "id_compra": 1,
  "fecha_compra": "2025-11-15T20:45:00.000Z",
  "id_proveedor": 1,
  "total": 3500,
  "estado": "completada",
  "notas": "Compra de repuestos para el mes de noviembre",
  "proveedor": {
    "id_proveedor": 1,
    "nombre": "AutoPartes SA",
    "email": "ventas@autopartes.com"
  },
  "compras_repuestos": [
    {
      "id": 1,
      "id_repuesto": 1,
      "cantidad": 50,
      "precio_unitario": 30,
      "subtotal": 1500,
      "repuesto": {
        "id_repuesto": 1,
        "nombre": "Filtro de aceite",
        "cantidad_existente": 75
      }
    },
    ...
  ]
}
```

#### **Listar Todas las Compras**
```http
GET http://localhost:3002/compras
Authorization: Bearer {{token}}
```

#### **Ver Detalles de una Compra**
```http
GET http://localhost:3002/compras/1
Authorization: Bearer {{token}}
```

#### **Ver Compras de un Proveedor Específico**
```http
GET http://localhost:3002/compras/proveedor/1
Authorization: Bearer {{token}}
```

#### **Actualizar Estado/Notas de una Compra**
```http
PATCH http://localhost:3002/compras/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "estado": "pendiente",
  "notas": "En espera de entrega"
}
```

**Nota:** No se pueden modificar el proveedor, total o repuestos después de crear la compra.

#### **Eliminar Compra** (Solo Administradores)
```http
DELETE http://localhost:3002/compras/1
Authorization: Bearer {{token}}
```

**¿Qué hace el DELETE?**
1. ✅ Revierte el stock (DECREMENTA las cantidades)
2. ✅ Elimina los detalles de la compra
3. ✅ Elimina la compra
4. ✅ Todo en una transacción atómica

---

## 📤 MÓDULO DE ÓRDENES - Salida de Inventario

### **Crear Orden de Trabajo (DISMINUYE EL STOCK)**
```http
POST http://localhost:3002/ordenes
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id_cliente": 1,
  "id_vehiculo": 1,
  "id_empleado_responsable": 2,
  "estado": "pendiente",
  "fecha_entrega_estimada": "2025-11-20T18:00:00.000Z",
  "total_estimado": 1400,
  "servicios": [
    {
      "id_servicio": 1,
      "cantidad": 1,
      "precio_unitario": 500
    }
  ],
  "repuestos": [
    {
      "id_repuesto": 1,
      "cantidad": 2,
      "precio_unitario": 150
    },
    {
      "id_repuesto": 2,
      "cantidad": 1,
      "precio_unitario": 750
    }
  ]
}
```

**¿Qué hace esta petición?**
1. ✅ Crea una orden de trabajo
2. ✅ Asocia servicios y repuestos
3. ✅ **DECREMENTA automáticamente el stock:**
   - Repuesto ID 1: -2 unidades
   - Repuesto ID 2: -1 unidad
4. ✅ Valida que haya suficiente stock
5. ✅ Todo en una transacción atómica

---

## 🔐 Permisos por Módulo

### Proveedores
| Acción | Admin | Supervisor | Técnico | Recepción |
|--------|-------|------------|---------|-----------|
| Crear | ✅ | ✅ | ❌ | ❌ |
| Ver | ✅ | ✅ | ✅ | ❌ |
| Actualizar | ✅ | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### Compras
| Acción | Admin | Supervisor | Técnico | Recepción |
|--------|-------|------------|---------|-----------|
| Crear | ✅ | ✅ | ❌ | ❌ |
| Ver | ✅ | ✅ | ✅ | ❌ |
| Actualizar | ✅ | ✅ | ❌ | ❌ |
| Eliminar | ✅ | ❌ | ❌ | ❌ |

### Órdenes
| Acción | Admin | Supervisor | Técnico | Recepción |
|--------|-------|------------|---------|-----------|
| Crear | ✅ | ✅ | ✅ | ❌ |
| Ver | ✅ | ✅ | ✅ | ✅ |
| Actualizar | ✅ | ✅ | ✅ | ❌ |
| Eliminar | ✅ | ✅ | ❌ | ❌ |

---

## 🧪 Caso de Uso Completo: Ciclo de Inventario

### Escenario: Compra de repuestos y uso en reparación

#### **Paso 1: Verificar Stock Actual**
```http
GET http://localhost:3002/repuestos
Authorization: Bearer {{token}}
```

**Stock Inicial:**
- Filtro de aceite (ID: 1): 25 unidades
- Pastillas de freno (ID: 2): 15 unidades

---

#### **Paso 2: Registrar Compra a Proveedor** (ENTRADA)
```http
POST http://localhost:3002/compras
Authorization: Bearer {{token}}

{
  "id_proveedor": 1,
  "total": 2900,
  "repuestos": [
    { "id_repuesto": 1, "cantidad": 50, "precio_unitario": 28 },
    { "id_repuesto": 2, "cantidad": 30, "precio_unitario": 70 }
  ]
}
```

**Stock Después de la Compra:**
- Filtro de aceite (ID: 1): 25 + 50 = **75 unidades** ✅
- Pastillas de freno (ID: 2): 15 + 30 = **45 unidades** ✅

---

#### **Paso 3: Crear Orden de Trabajo** (SALIDA)
```http
POST http://localhost:3002/ordenes
Authorization: Bearer {{token}}

{
  "id_cliente": 1,
  "id_vehiculo": 1,
  "id_empleado_responsable": 2,
  "estado": "pendiente",
  "total_estimado": 1000,
  "repuestos": [
    { "id_repuesto": 1, "cantidad": 3, "precio_unitario": 150 },
    { "id_repuesto": 2, "cantidad": 2, "precio_unitario": 250 }
  ]
}
```

**Stock Después de la Orden:**
- Filtro de aceite (ID: 1): 75 - 3 = **72 unidades** ✅
- Pastillas de freno (ID: 2): 45 - 2 = **43 unidades** ✅

---

#### **Paso 4: Verificar Stock Final**
```http
GET http://localhost:3002/repuestos
Authorization: Bearer {{token}}
```

**Resultado:**
- ✅ Compra registrada
- ✅ Stock incrementado correctamente
- ✅ Orden creada
- ✅ Stock decrementado correctamente
- ✅ Trazabilidad completa

---

## 🛡️ Protecciones del Sistema

### 1. **Validación de Stock en Órdenes**
```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para Filtro de aceite. Disponible: 5, Solicitado: 10"
}
```

### 2. **Transacciones Atómicas**
- ✅ Si algo falla, TODO se revierte
- ✅ No hay estados inconsistentes
- ✅ Stock siempre sincronizado

### 3. **Validación de Proveedores**
```json
{
  "statusCode": 404,
  "message": "Proveedor con ID 99 no encontrado"
}
```

### 4. **Validación de Repuestos**
```json
{
  "statusCode": 404,
  "message": "Repuesto con ID 99 no encontrado"
}
```

### 5. **Email Único en Proveedores**
```json
{
  "statusCode": 400,
  "message": "Ya existe un proveedor con ese email"
}
```

---

## 📊 Consultas Útiles

### **Repuestos con Stock Bajo**
```http
GET http://localhost:3002/repuestos/stock-bajo
Authorization: Bearer {{token}}
```

### **Historial de Compras de un Proveedor**
```http
GET http://localhost:3002/compras/proveedor/1
Authorization: Bearer {{token}}
```

### **Estadísticas del Taller**
```http
GET http://localhost:3002/stats/kpis
Authorization: Bearer {{token}}
```

---

## 🎯 Beneficios del Sistema

### ✅ Trazabilidad Completa
- Cada compra está vinculada a un proveedor
- Cada orden está vinculada a cliente, vehículo y técnico
- Historial completo de movimientos de inventario

### ✅ Integridad de Datos
- Transacciones atómicas
- Validaciones en todas las operaciones
- No permite estados inconsistentes

### ✅ Control de Acceso
- Permisos granulares por rol
- Autenticación JWT
- Protección en todos los endpoints

### ✅ Facilidad de Uso
- API RESTful clara
- Documentación completa
- Ejemplos de uso

---

## 🚀 Próximos Pasos Sugeridos

1. **Reportes Avanzados**
   - Rotación de inventario
   - Análisis de proveedores
   - Rentabilidad por servicio

2. **Alertas Automáticas**
   - Notificaciones de stock bajo
   - Recordatorios de compra
   - Alertas de proveedores inactivos

3. **Dashboard Frontend**
   - Gráficos de inventario
   - KPIs en tiempo real
   - Gestión visual de compras y órdenes

4. **Integración con Facturación**
   - Generar facturas automáticas
   - Control de pagos
   - Reportes fiscales

---

## 📝 Notas Importantes

1. **Las compras incrementan el stock automáticamente**
2. **Las órdenes decrementan el stock automáticamente**
3. **Eliminar una compra revierte el incremento de stock**
4. **No se puede usar más repuestos de los disponibles**
5. **Todas las operaciones críticas usan transacciones**

---

¡El sistema completo de inventario está listo! 🎉
