## 🛡️ Autorización Sólida (Roles y Permisos)

Esta PR fortalece la capa de autorización del sistema, implementando un modelo híbrido para asegurar el acceso a los recursos.

### 📋 Tipos de Autorizaciones Utilizados

1. **RBAC (Role-Based Access Control):**
   * *Implementación:* Se creó un decorador personalizado `@Roles()` y un `RolesGuard` nativo de NestJS (ya existente en `backend/src/auth`).
   * *Chequeo Principal:* Verifica que el campo `rol` dentro del payload del JWT decodificado coincida con los roles autorizados para el endpoint.
   * *Casos de Uso:* Bloquear el acceso completo a módulos sensibles (ej. Empleados, Finanzas) a roles no autorizados.

2. **ABAC (Attribute-Based Access Control) / Ownership Check:**
   * *Implementación:* Chequeos lógicos a nivel de Servicio en `OrdenesService`.
   * *Chequeo Principal:* Compara los atributos del usuario autenticado (ej. `user.id_usuario`) contra los atributos del recurso solicitado (ej. `orden.id_cliente` o `orden.id_empleado_responsable`).
   * *Casos de Uso:* Un `cliente` puede hacer `GET /ordenes/:id` solo si la orden le pertenece. Un `tecnico` solo puede actualizar el estado de órdenes que le estén asignadas.

*Se adjunta video demostrativo de la arquitectura de autorización.*

---

### Cambios principales en esta PR

- Se añadieron checks ABAC en `OrdenesService`:
  - `findOne(id, user)` ahora valida que un `cliente` solo vea sus órdenes.
  - `updateEstado(id, estado, user)` valida que un `tecnico` solo modifique órdenes asignadas.
- `OrdenesController` ahora pasa `req.user` a los servicios en endpoints sensibles.
- El decorador `@Roles()` y `RolesGuard` ya están presentes en `backend/src/auth` y se usan para control de acceso por módulos.

---


### Notas adicionales

- Revisar `backend/src/auth/roles.guard.ts` y `backend/src/auth/decorators/roles.decorator.ts` para la lógica RBAC.
- Revisar `backend/src/ordenes/ordenes.controller.ts` y `backend/src/ordenes/ordenes.service.ts` para los ejemplos ABAC.
