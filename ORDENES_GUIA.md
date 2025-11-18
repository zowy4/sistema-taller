# Sistema de Gestión de Inventario - Guía de Uso

## 📋 Flujo Completo: Entrada y Salida de Inventario

Este sistema maneja el inventario de repuestos en dos direcciones:

### 📦 ENTRADA: Compras a Proveedores
- Cuando recibes mercancía de un proveedor, creas una **Compra**
- El stock de repuestos **aumenta** automáticamente

### 📤 SALIDA: Órdenes de Trabajo
- Cuando usas repuestos en una reparación, creas una **Orden de Trabajo**
- El stock de repuestos **disminuye** automáticamente
- **Protección**: No puedes usar más repuestos de los que tienes en stock

---

## 🚀 Guía de Pruebas con Postman

### 1️⃣ Autenticación

**Login como Administrador**
```http
POST http://localhost:3002/auth/login
Content-Type: application/json

{
  "email": "admin@taller.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

📝 **Copia el `access_token`** y úsalo en todas las siguientes peticiones como:
- Authorization → Type: **Bearer Token**
- Token: `tu_access_token_aqui`

---

### 2️⃣ Crear una Orden de Trabajo (SALIDA de Inventario)

**Endpoint:**
```http
POST http://localhost:3002/ordenes
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (JSON):**
```json
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
1. Crea una orden de trabajo
2. Asocia los servicios especificados
3. Asocia los repuestos especificados
4. **DESCUENTA automáticamente el stock:**
   - Repuesto ID 1: -2 unidades
   - Repuesto ID 2: -1 unidad
5. Si no hay suficiente stock, devuelve error 400

**Respuesta Exitosa (201 Created):**
```json
{
  "id_orden": 1,
  "fecha_apertura": "2025-11-15T20:30:00.000Z",
  "id_cliente": 1,
  "id_vehiculo": 1,
  "estado": "pendiente",
  "total_estimado": 1400,
  "cliente": {
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "vehiculo": {
    "placa": "ABC123",
    "marca": "Toyota"
  },
  "servicios_asignados": [...],
  "repuestos_usados": [...]
}
```

---

### 3️⃣ Verificar el Stock Actualizado

**Ver todos los repuestos:**
```http
GET http://localhost:3002/repuestos
Authorization: Bearer {{token}}
```

**Ver repuestos con stock bajo:**
```http
GET http://localhost:3002/repuestos/stock-bajo
Authorization: Bearer {{token}}
```

---

### 4️⃣ Listar Todas las Órdenes

```http
GET http://localhost:3002/ordenes
Authorization: Bearer {{token}}
```

---

### 5️⃣ Ver Detalles de una Orden Específica

```http
GET http://localhost:3002/ordenes/1
Authorization: Bearer {{token}}
```

---

### 6️⃣ Actualizar Estado de una Orden

```http
PATCH http://localhost:3002/ordenes/1/estado
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "estado": "en_proceso"
}
```

**Estados permitidos:**
- `pendiente`
- `en_proceso`
- `completada`
- `cancelada`

---

## 🔐 Permisos por Rol

### Crear Órdenes (POST /ordenes)
✅ `administrador`
✅ `supervisor`
✅ `tecnico`
❌ `recepcion`

### Ver Órdenes (GET /ordenes)
✅ Todos los roles autenticados

### Actualizar Órdenes (PATCH /ordenes/:id)
✅ `administrador`
✅ `supervisor`
✅ `tecnico`
❌ `recepcion`

### Eliminar Órdenes (DELETE /ordenes/:id)
✅ `administrador`
✅ `supervisor`
❌ `tecnico`
❌ `recepcion`

---

## 🛡️ Protecciones del Sistema

### 1. Validación de Stock
❌ **No puedes usar más repuestos de los disponibles**
```json
{
  "statusCode": 400,
  "message": "Stock insuficiente para Filtro de aceite. Disponible: 5, Solicitado: 10"
}
```

### 2. Transacciones Atómicas
Si **cualquier paso falla**, toda la operación se revierte:
- Si falla la creación de la orden → No se crea nada
- Si falla el descuento de stock → Se revierte todo
- Si falta un repuesto → Se cancela la operación completa

### 3. Autenticación Requerida
❌ Sin token válido:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 4. Autorización por Roles
❌ Sin permisos suficientes:
```json
{
  "statusCode": 403,
  "message": "Acceso denegado. Se requiere uno de los siguientes roles: administrador, supervisor, tecnico"
}
```

---

## 📊 Datos de Prueba

### Empleados Disponibles:
- **Admin**: admin@taller.com / password123 (id: 1)
- **Supervisor**: supervisor@taller.com / password123 (id: 2)
- **Técnico**: tecnico@taller.com / password123 (id: 3)

### Clientes de Prueba:
- Cliente ID: 1 (Juan Pérez)
- Cliente ID: 2 (María González)

### Vehículos de Prueba:
- Vehículo ID: 1 (Toyota Corolla 2020)
- Vehículo ID: 2 (Honda Civic 2019)

### Servicios Disponibles:
- Servicio ID: 1 - Cambio de aceite ($500)
- Servicio ID: 2 - Alineación y balanceo ($350)
- Servicio ID: 3 - Revisión completa ($800)

### Repuestos Iniciales:
- Repuesto ID: 1 - Filtro de aceite (Stock: 25)
- Repuesto ID: 2 - Pastillas de freno (Stock: 15)
- Repuesto ID: 3 - Filtro de aire (Stock: 20)

---

## 🧪 Caso de Prueba Completo

### Escenario: Cambio de aceite con repuestos

1. **Login** con admin@taller.com
2. **Verificar stock inicial** de repuestos (GET /repuestos)
3. **Crear orden** usando:
   - 1x Filtro de aceite (ID: 1)
   - 1x Filtro de aire (ID: 3)
   - Servicio: Cambio de aceite (ID: 1)
4. **Verificar stock actualizado** (debe haber disminuido)
5. **Ver la orden creada** con todos sus detalles
6. **Actualizar estado** de "pendiente" a "en_proceso"
7. **Completar la orden** cambiando estado a "completada"

---

## ❌ Errores Comunes

### 1. "Stock insuficiente"
**Causa:** Intentas usar más repuestos de los disponibles
**Solución:** Verifica el stock disponible antes de crear la orden

### 2. "Repuesto con ID X no encontrado"
**Causa:** El ID del repuesto no existe en la base de datos
**Solución:** Usa GET /repuestos para ver los IDs válidos

### 3. "Unauthorized"
**Causa:** Token expirado o inválido
**Solución:** Haz login nuevamente para obtener un nuevo token

### 4. "Acceso denegado"
**Causa:** Tu rol no tiene permisos para esta acción
**Solución:** Usa una cuenta con el rol adecuado

---

## 📝 Notas Importantes

1. **Las transacciones son atómicas**: Todo o nada
2. **El stock se actualiza en tiempo real**
3. **Los precios se guardan en la orden** (no se actualizan si cambia el precio del repuesto después)
4. **Las órdenes no se pueden eliminar si tienen factura** (integridad referencial)
5. **El sistema valida automáticamente** los datos de entrada

---

## 🔄 Próximo Paso: Compras a Proveedores

En la siguiente fase implementaremos:
- Módulo de Proveedores (CRUD)
- Módulo de Compras (para AUMENTAR el stock)
- Reportes de inventario
- Alertas de stock bajo

¡El backend está listo para usarse! 🎉
