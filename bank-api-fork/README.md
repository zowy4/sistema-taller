# Bank API Fork - Security Best Practices

Este es un fork del ejemplo de API bancaria, refactorizado siguiendo el patrón **Entrada → Procesamiento → Salida** con ElysiaJS aplicando prácticas básicas de seguridad.

**Estado Actual**: ✅ API funcionando en `http://localhost:3002` con Node.js HTTP server + Elysia fetch handler.

## Arquitectura del Patrón Implementado

### 🔒 **Entrada (Validación y Sanitización)**
- **Validación estricta**: Uso del sistema de tipos `t` de Elysia para validar entrada de datos
- **Modelos reutilizables**: Definición de esquemas para `user` y `login`
- **Validación automática**: Rechazo automático de datos malformados antes del procesamiento

### ⚙️ **Procesamiento (Manejo de Excepciones)**
- **Manejo de errores controlado**: Uso de `error()` para devolver códigos HTTP apropiados
- **Verificación de existencia**: Comprobación de usuarios antes de operaciones
- **Resiliencia**: La aplicación no falla, devuelve errores controlados

### 📤 **Salida (Minimización de Datos)**
- **Sanitización**: Función `sanitizeUser()` elimina datos sensibles (contraseñas)
- **Datos mínimos**: Solo se envía la información necesaria al cliente
- **Seguridad por defecto**: Nunca se exponen contraseñas o datos internos

## Mejoras Implementadas

### 🔐 **Validación de Entrada**
- **Esquemas TypeScript**: `t.Object()`, `t.String()`, `t.Numeric()`
- **Validación automática**: Parámetros y body validados antes del procesamiento
- **Tipado seguro**: Interfaz `User` para consistencia interna

### 🚨 **Manejo de Errores**
- **Códigos HTTP correctos**: 404 para no encontrado, 401 para auth fallida, 201 para creación
- **Mensajes descriptivos**: Errores claros sin exponer información interna
- **Excepciones controladas**: No hay crashes del servidor

### 🛡️ **Seguridad de Datos**
- **Sanitización automática**: `sanitizeUser()` remueve campos sensibles
- **Login seguro**: Solo devuelve token simulado y datos mínimos
- **No exposición de passwords**: Nunca se devuelven contraseñas en respuestas

## Instalación y Uso

```bash
cd bank-api-fork
npm install
npm run dev
```

El servidor se ejecutará en `http://localhost:3002`.

## Endpoints

### Información General
- `GET /` - Información de la API y lista de endpoints disponibles

### Públicos
- `GET /users` - Lista de usuarios (sin contraseñas)
- `POST /login` - Login con curp/password, devuelve token simulado

### Con Validación
- `GET /users/:id` - Usuario específico (ID numérico requerido)
- `POST /users` - Crear usuario (datos validados)
- `PUT /users/:id` - Actualizar usuario (campos opcionales)
- `DELETE /users/:id` - Eliminar usuario

## Variables de Entorno

```bash
JWT_SECRET=your-secret-key-change-in-production
```

## Ejemplos de Uso

### Crear Usuario
```json
POST /users
{
  "name": "Juan Perez",
  "address": "Calle Principal 123",
  "curp": "JUAP900101HDFRRR01",
  "rfc": "JUAP900101ABC",
  "password": "securepass123"
}
```

### Login
```json
POST /login
{
  "curp": "CURP11860",
  "password": "pass1234"
}
```

## Notas de Seguridad

- En producción, implementar JWT real en lugar del token simulado
- Usar base de datos persistente en lugar de memoria
- Implementar rate limiting para prevenir ataques de fuerza bruta
- Usar HTTPS en producción
- Validar y sanitizar todos los inputs del usuario

## Verificación del Funcionamiento

Para verificar que la API está funcionando correctamente:

1. Ejecuta `npm run dev`
2. Abre en tu navegador: `http://localhost:3002/`
3. Prueba los endpoints: `http://localhost:3002/users`

La API responderá con datos JSON mostrando que todos los endpoints están operativos.