# Módulo de Clientes - CRUD Completo

## 📋 Descripción
Módulo completo de gestión de clientes con todas las operaciones CRUD (Crear, Leer, Actualizar, Eliminar).

## 🚀 Funcionalidades Implementadas

### 1. **Listar Clientes** (`/admin/clients`)
- ✅ Tabla con todos los clientes
- ✅ Muestra: ID, Nombre, Email, Teléfono
- ✅ Botón para crear nuevo cliente
- ✅ Botones de acción (Editar/Eliminar) en cada fila

### 2. **Crear Cliente** (`/admin/clients/new`)
- ✅ Formulario con validación
- ✅ Campos: Nombre, Apellido, Email, Teléfono, Dirección, Empresa (opcional)
- ✅ Campos obligatorios marcados con asterisco rojo
- ✅ Redirección automática a la lista después de crear
- ✅ Manejo de errores

### 3. **Editar Cliente** (`/admin/clients/[id]/edit`)
- ✅ Carga automática de datos del cliente
- ✅ Formulario prellenado con información actual
- ✅ Actualización mediante PATCH
- ✅ Validación de campos
- ✅ Redirección a la lista después de guardar

### 4. **Eliminar Cliente**
- ✅ Confirmación antes de eliminar
- ✅ Actualización automática de la lista
- ✅ Feedback visual durante la eliminación
- ✅ Solo disponible para usuarios con rol "admin"

## 🔐 Permisos Requeridos

| Operación | Roles Permitidos | Permiso Requerido |
|-----------|------------------|-------------------|
| Listar    | admin            | `clientes:read`   |
| Crear     | admin, supervisor, recepcion | `clientes:create` |
| Ver uno   | admin, supervisor, tecnico, recepcion | `clientes:read` |
| Actualizar | admin, supervisor, recepcion | `clientes:update` |
| Eliminar  | admin            | `clientes:delete` |

## 🛠️ Estructura de Archivos

```
frontend/src/app/admin/clients/
├── page.tsx                    # Lista de clientes
├── new/
│   └── page.tsx               # Formulario de creación
└── [id]/
    └── edit/
        └── page.tsx           # Formulario de edición
```

## 📡 Endpoints del Backend

```typescript
// Listar todos los clientes
GET /clientes

// Obtener un cliente específico
GET /clientes/:id

// Crear nuevo cliente
POST /clientes
Body: {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  empresa?: string;
}

// Actualizar cliente
PATCH /clientes/:id
Body: (mismos campos que POST, todos opcionales)

// Eliminar cliente
DELETE /clientes/:id
```

## 💡 Uso

### Acceso al Módulo
1. Iniciar sesión como administrador
2. Navegar a `/admin/clients`

### Crear Cliente
1. Click en "Nuevo Cliente"
2. Llenar el formulario
3. Click en "Crear Cliente"

### Editar Cliente
1. En la lista, click en "✏️ Editar"
2. Modificar los campos deseados
3. Click en "Guardar Cambios"

### Eliminar Cliente
1. En la lista, click en "🗑️ Eliminar"
2. Confirmar en el diálogo
3. El cliente se eliminará de la lista

## 🎨 Características de UX

- **Feedback Visual**: Botones cambian de estado durante operaciones
- **Confirmaciones**: Diálogo de confirmación antes de eliminar
- **Validación**: Campos obligatorios marcados
- **Navegación**: Links de "Volver" en formularios
- **Estados de Carga**: Indicadores mientras se procesan peticiones
- **Manejo de Errores**: Mensajes claros de error
- **Responsive**: Funciona en móviles y desktop

## 🔧 Mejoras Futuras Sugeridas

1. **Búsqueda y Filtros**
   - Buscar por nombre, email o teléfono
   - Filtrar por empresa

2. **Paginación**
   - Para listas grandes de clientes

3. **Modal de Confirmación**
   - Reemplazar `confirm()` nativo con modal personalizado

4. **Validación Avanzada**
   - Formato de email
   - Formato de teléfono
   - Verificar duplicados

5. **Exportación**
   - Exportar lista a CSV/Excel

6. **Vista de Detalle**
   - Página separada con información completa del cliente
   - Historial de servicios

## 🧪 Testing

### Credenciales de Prueba
- **Admin**: admin@taller.com / password123
- **Supervisor**: supervisor@taller.com / password123
- **Recepción**: recepcion@taller.com / password123

### Casos de Prueba
- ✅ Crear cliente con todos los campos
- ✅ Crear cliente sin empresa (opcional)
- ✅ Editar cliente existente
- ✅ Eliminar cliente
- ✅ Intentar crear con email duplicado
- ✅ Intentar acceder sin autenticación
- ✅ Intentar eliminar sin permisos de admin

## 📝 Notas Técnicas

- Usa Next.js App Router con componentes cliente (`"use client"`)
- Rutas dinámicas con `[id]` para edición
- Estado local con `useState` para formularios
- `useRouter` para navegación programática
- `useEffect` para cargar datos del servidor
- Tokens JWT en localStorage para autenticación
