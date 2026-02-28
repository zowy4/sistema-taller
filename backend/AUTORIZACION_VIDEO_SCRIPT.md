🎬 Guion para el Video (Duración aprox. 3-4 minutos)

[0:00 - Pantalla: `backend/src/auth/roles.guard.ts` y `backend/src/auth/decorators/roles.decorator.ts` en VS Code]
- Voz: "Hola, en este video voy a explicar la arquitectura de autorización implementada en el Sistema de Gestión de Taller. Para asegurar los recursos, estamos utilizando un modelo híbrido que combina RBAC y ABAC."
- Voz: "Primero, el RBAC. En NestJS usamos `@Roles()` y `RolesGuard`. Cuando un usuario se autentica, su JWT contiene su rol. El Guard intercepta la petición, lee los roles permitidos en la ruta mediante `@Roles()` y verifica si el usuario tiene permiso. Si no, lanza `403 Forbidden`."

[1:00 - Pantalla: `backend/src/ordenes/ordenes.controller.ts` y `backend/src/ordenes/ordenes.service.ts`]
- Voz: "RBAC controla acceso por módulo. Por ejemplo, en `OrdenesController` solo ciertos roles pueden acceder a rutas generales."
- Voz: "Pero RBAC no es suficiente para datos por fila: implementamos ABAC (Ownership Checks) en `OrdenesService`."

[1:30 - Pantalla: Mostrar el método `findOne(id, user)`]
- Voz: "Aquí `findOne(id, user)` obtiene la orden y, si el usuario es `cliente`, compara `orden.id_cliente` con `user.id_usuario`. Si no coinciden, se lanza `403`."

[2:00 - Pantalla: Mostrar `updateEstado(id, estado, user)`]
- Voz: "Para cambios de estado, si el usuario tiene rol `tecnico`, verificamos que `orden.id_empleado_responsable` coincida con `user.id_usuario`. Así el técnico solo modifica sus propias órdenes."

[2:30 - Pantalla: Navegador/Postman]
- Voz: "Demo: Inicio sesión como técnico y trato de cambiar el estado de una orden asignada a otro técnico → recibo `403`."
- Voz: "Inicio sesión como cliente y trato de ver una orden que no es mía → recibo `403`."

[3:10 - Cierre]
- Voz: "En resumen: RBAC protege módulos y rutas; ABAC (ownership) protege datos sensibles por fila. Todo se evalúa en el backend, nunca en el frontend."

---

Instrucciones rápidas de grabación:
- Graba pantalla full HD, muestra código en VS Code con fuente legible.
- Muestra peticiones en Postman/Insomnia o el frontend para evidenciar respuestas 403.
- Adjunta al PR el vídeo (subir a Drive/YouTube privado y pegar link en la PR) o subir archivo en el sistema de revisión si aplica.
