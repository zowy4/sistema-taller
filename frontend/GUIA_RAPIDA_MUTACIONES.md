# 🎯 GUÍA RÁPIDA: Cómo Usar Mutaciones Optimistas

## 📦 Paso 1: Importar el Hook

```typescript
import { useClientesMutations } from '@/hooks/useClientesMutations';
```

## 🔥 Paso 2: Inicializar Mutaciones en tu Componente

```typescript
export default function ClientesPage() {
  const { createMutation, updateMutation, deleteMutation } = useClientesMutations();
  
  // ... resto de tu código
}
```

## ⚡ Paso 3: Usar las Mutaciones

### Crear Cliente
```typescript
const handleCreate = () => {
  createMutation.mutate({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    telefono: '555-1234',
    activo: true,
  });
  
  // ¡La UI se actualiza INMEDIATAMENTE!
  // No necesitas esperar con "await"
  setModalOpen(false); // Cierra el modal al instante
};
```

### Actualizar Cliente
```typescript
const handleUpdate = (id: number) => {
  updateMutation.mutate({
    id: id,
    data: { telefono: '555-9999' }
  });
  
  // ¡El cambio aparece al instante en la tabla!
};
```

### Eliminar Cliente
```typescript
const handleDelete = (id: number) => {
  if (confirm('¿Eliminar?')) {
    deleteMutation.mutate(id);
    
    // ¡La fila desaparece inmediatamente!
    // Si el servidor falla, volverá a aparecer (rollback automático)
  }
};
```

### Toggle Estado Activo/Inactivo
```typescript
const handleToggleActivo = (cliente: Cliente) => {
  updateMutation.mutate({
    id: cliente.id_cliente,
    data: { activo: !cliente.activo }
  });
  
  // ¡El badge cambia de color instantáneamente!
};
```

## 🎨 Paso 4: Usar Estados de Loading (Opcional)

```typescript
<button 
  onClick={() => deleteMutation.mutate(id)}
  disabled={deleteMutation.isPending}
>
  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
</button>
```

## 🚀 Hooks Disponibles

### 1. Clientes
```typescript
import { useClientesMutations } from '@/hooks/useClientesMutations';

const { createMutation, updateMutation, deleteMutation } = useClientesMutations();
```

### 2. Órdenes
```typescript
import { useOrdenesMutations } from '@/hooks/useOrdenesMutations';

const { 
  createMutation,        // Crear orden
  updateMutation,        // Actualizar orden
  updateEstadoMutation,  // Cambiar estado (pendiente → en_proceso → completada)
  deleteMutation         // Eliminar orden
} = useOrdenesMutations();
```

**Ejemplo: Cambiar estado de orden**
```typescript
const handleCambiarEstado = (idOrden: number, nuevoEstado: string) => {
  updateEstadoMutation.mutate({
    id: idOrden,
    estado: nuevoEstado // 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
  });
};
```

### 3. Repuestos
```typescript
import { useRepuestosMutations } from '@/hooks/useRepuestosMutations';

const { 
  createMutation,         // Crear repuesto
  updateMutation,         // Actualizar repuesto
  ajustarStockMutation,   // Entrada/Salida de stock
  deleteMutation          // Eliminar repuesto
} = useRepuestosMutations();
```

**Ejemplo: Ajustar stock**
```typescript
// Entrada de mercancía
const handleEntradaStock = (idRepuesto: number, cantidad: number) => {
  ajustarStockMutation.mutate({
    id: idRepuesto,
    cantidad: cantidad,
    tipo: 'entrada'
  });
  // ¡El stock aumenta INMEDIATAMENTE en la UI!
};

// Salida por venta
const handleSalidaStock = (idRepuesto: number, cantidad: number) => {
  ajustarStockMutation.mutate({
    id: idRepuesto,
    cantidad: cantidad,
    tipo: 'salida'
  });
  // ¡El stock disminuye INMEDIATAMENTE!
  // Si no hay stock suficiente, se revierte automáticamente
};
```

## 💡 Patrones Comunes

### Patrón 1: Modal de Formulario
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const { createMutation } = useClientesMutations();

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  createMutation.mutate(formData);
  
  // Cerrar modal SIN esperar respuesta del servidor
  setIsModalOpen(false);
};
```

### Patrón 2: Botón con Confirmación
```typescript
const { deleteMutation } = useClientesMutations();

const handleDelete = (id: number, nombre: string) => {
  const confirmed = confirm(`¿Eliminar a ${nombre}?`);
  
  if (confirmed) {
    deleteMutation.mutate(id);
  }
};
```

### Patrón 3: Dropdown de Acciones
```typescript
const { updateEstadoMutation } = useOrdenesMutations();

<select 
  value={orden.estado}
  onChange={(e) => updateEstadoMutation.mutate({
    id: orden.id_orden,
    estado: e.target.value
  })}
  disabled={updateEstadoMutation.isPending}
>
  <option value="pendiente">Pendiente</option>
  <option value="en_proceso">En Proceso</option>
  <option value="completada">Completada</option>
</select>
```

### Patrón 4: Toggle Switch
```typescript
const { updateMutation } = useClientesMutations();

<button 
  onClick={() => updateMutation.mutate({
    id: cliente.id_cliente,
    data: { activo: !cliente.activo }
  })}
  className={cliente.activo ? 'bg-green-500' : 'bg-gray-400'}
>
  {cliente.activo ? 'ACTIVO' : 'INACTIVO'}
</button>
```

## ⚠️ Importante: NO hagas esto

### ❌ MAL: Usar async/await
```typescript
// ❌ NO HAGAS ESTO
const handleDelete = async (id: number) => {
  await deleteMutation.mutateAsync(id); // ← Pierde la inmediatez
  setModalOpen(false);
};
```

### ✅ BIEN: Usa .mutate() directamente
```typescript
// ✅ HAZ ESTO
const handleDelete = (id: number) => {
  deleteMutation.mutate(id); // ← Inmediato
  setModalOpen(false);       // ← Se ejecuta al instante
};
```

## 🎭 ¿Qué pasa si falla?

**Escenario:** Intentas eliminar un cliente que tiene órdenes activas.

```
1. Haces clic en "Eliminar"
2. La fila DESAPARECE al instante (actualización optimista)
3. El servidor responde: 400 Bad Request
   "No se puede eliminar: el cliente tiene órdenes activas"
4. LA FILA VUELVE A APARECER (rollback automático)
5. Se muestra un alert con el error
```

**Tú no tienes que hacer nada. El hook lo maneja automáticamente.**

## 📊 Queries que se Actualizan Automáticamente

Cuando usas una mutación, estas queries se invalidan y refrescan automáticamente:

### Clientes
- `['clientes']` - Lista principal
- `['cliente', id]` - Detalle individual

### Órdenes
- `['ordenes']` - Lista principal
- `['orden', id]` - Detalle individual
- `['alertas-ordenes']` - Órdenes pendientes en alertas
- `['dashboard-kpis']` - KPIs del dashboard

### Repuestos
- `['repuestos']` - Lista principal
- `['repuesto', id]` - Detalle individual
- `['alertas-stock-bajo']` - Repuestos con stock bajo
- `['dashboard-stock-bajo']` - Widget de stock en dashboard
- `['dashboard-kpis']` - KPIs del dashboard

**Esto significa:** Si tienes el dashboard abierto en otra pestaña y creas un cliente, el contador de clientes se actualizará automáticamente. 🤯

## 🎉 Resultado

Tu aplicación ahora se siente como **Notion, Linear, o Figma**:
- ⚡ 0ms de latencia percibida
- 🔄 Sincronización automática entre vistas
- 🛡️ Rollback automático ante errores
- 🧹 Código limpio sin boilerplate

**¡Disfruta de tu nueva UX profesional!** 🚀
