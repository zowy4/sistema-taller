# 🚀 Mutaciones Optimistas con Tanstack Query

## ¿Qué son las Mutaciones Optimistas?

Las **Mutaciones Optimistas** (Optimistic Updates) son el "secreto" para que las aplicaciones web modernas se sientan instantáneas, como una app nativa de escritorio.

### Flujo Tradicional ❌
```
Usuario hace clic → Mostrar spinner de carga → Esperar respuesta del servidor (500-2000ms) → Actualizar UI
```

### Flujo con Mutaciones Optimistas ✅
```
Usuario hace clic → Actualizar UI INMEDIATAMENTE (0ms) → Enviar petición al servidor en 2do plano
                  → Si falla (raro): Revertir automáticamente (rollback)
```

## 🎯 Beneficios

| Aspecto | Sin Optimistic Updates | Con Optimistic Updates |
|---------|------------------------|------------------------|
| **Tiempo percibido** | 500-2000ms de espera | 0ms - Instantáneo |
| **Experiencia de usuario** | Frustración con spinners | Sensación de app nativa |
| **Código del componente** | Manejo manual de estados | Limpio y declarativo |
| **Manejo de errores** | Manual con try/catch | Automático con rollback |
| **Sincronización de caché** | Manual con setState | Automática con QueryClient |

## 📦 Estructura de Archivos Creados

```
frontend/
├── src/
│   ├── hooks/                           # 🆕 Custom Hooks de Mutaciones
│   │   ├── useClientesMutations.ts      # Clientes (Create, Update, Delete)
│   │   ├── useOrdenesMutations.ts       # Órdenes (Create, Update, UpdateEstado, Delete)
│   │   └── useRepuestosMutations.ts     # Repuestos (Create, Update, AjustarStock, Delete)
│   │
│   ├── services/                        # Servicios API (ya existentes)
│   │   ├── clientes.service.ts
│   │   ├── ordenes.service.ts
│   │   ├── repuestos.service.ts
│   │   ├── facturas.service.ts
│   │   └── vehiculos.service.ts
│   │
│   └── app/admin/clientes/
│       └── EJEMPLO_MUTACIONES_OPTIMISTAS.tsx  # 📘 Ejemplo completo funcional
```

## 🔥 Hooks Creados

### 1. `useClientesMutations`

Maneja todas las mutaciones del módulo de **Clientes**:

```typescript
import { useClientesMutations } from '@/hooks/useClientesMutations';

const { createMutation, updateMutation, deleteMutation } = useClientesMutations();

// Crear cliente
createMutation.mutate({
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com',
  telefono: '555-1234',
  activo: true,
});

// Actualizar cliente
updateMutation.mutate({
  id: 1,
  data: { telefono: '555-9999' }
});

// Eliminar cliente
deleteMutation.mutate(1);
```

**Características:**
- ✅ Cliente aparece/desaparece instantáneamente en la tabla
- ✅ Si falla, revierte automáticamente
- ✅ Maneja errores UNAUTHORIZED/FORBIDDEN
- ✅ Actualiza queries relacionadas: `['clientes']`, `['cliente', id]`

---

### 2. `useOrdenesMutations`

Maneja todas las mutaciones del módulo de **Órdenes**:

```typescript
import { useOrdenesMutations } from '@/hooks/useOrdenesMutations';

const { 
  createMutation, 
  updateMutation, 
  updateEstadoMutation,
  deleteMutation 
} = useOrdenesMutations();

// Cambiar estado de orden (pendiente → en_proceso → completada)
updateEstadoMutation.mutate({
  id: 5,
  estado: 'en_proceso'
});
```

**Características:**
- ✅ Cambios de estado instantáneos (sin recargar)
- ✅ Actualiza múltiples queries: `['ordenes']`, `['alertas-ordenes']`, `['dashboard-kpis']`
- ✅ Rollback automático si el servidor rechaza el cambio

---

### 3. `useRepuestosMutations`

Maneja todas las mutaciones del módulo de **Repuestos** (incluido ajuste de stock):

```typescript
import { useRepuestosMutations } from '@/hooks/useRepuestosMutations';

const { 
  createMutation, 
  updateMutation, 
  ajustarStockMutation,
  deleteMutation 
} = useRepuestosMutations();

// Ajustar stock (entrada de mercancía)
ajustarStockMutation.mutate({
  id: 10,
  cantidad: 50,
  tipo: 'entrada'
});

// Ajustar stock (salida por venta)
ajustarStockMutation.mutate({
  id: 10,
  cantidad: 5,
  tipo: 'salida'
});
```

**Características:**
- ✅ Stock se actualiza instantáneamente en la UI
- ✅ Valida stock negativo (no permite < 0)
- ✅ Actualiza alertas de stock bajo automáticamente
- ✅ Si falla (ej: stock insuficiente), revierte el cambio

---

## 💡 Ejemplo de Uso Completo

Revisa el archivo **`EJEMPLO_MUTACIONES_OPTIMISTAS.tsx`** que incluye:

- ✅ Tabla completa de clientes con useQuery
- ✅ Botones de Crear/Editar/Eliminar con mutaciones optimistas
- ✅ Modal de formulario
- ✅ Toggle de estado activo/inactivo
- ✅ Manejo de loading states (`isPending`)
- ✅ Todo el código listo para copiar/pegar

### Código Simplificado del Componente

```typescript
export default function ClientesPage() {
  // Query: Obtener datos
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => fetchClientes(token!),
  });

  // Mutaciones: Crear, Editar, Eliminar
  const { updateMutation, deleteMutation } = useClientesMutations();

  // Handler: Eliminar cliente
  const handleDelete = (id: number) => {
    if (confirm('¿Borrar cliente?')) {
      // ¡La fila desaparece al instante!
      deleteMutation.mutate(id);
    }
  };

  return (
    <table>
      {clientes.map(cliente => (
        <tr key={cliente.id_cliente}>
          <td>{cliente.nombre}</td>
          <td>
            <button 
              onClick={() => handleDelete(cliente.id_cliente)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Borrando...' : 'Eliminar'}
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
}
```

**Observa que:**
- ❌ No hay `useState` para loading/error/data
- ❌ No hay `useEffect` con fetches manuales
- ❌ No hay spinners bloqueantes
- ✅ Solo llamadas simples a `.mutate()`
- ✅ UI se actualiza instantáneamente

---

## 🔧 Anatomía de un Hook de Mutación

Cada hook sigue este patrón:

```typescript
const createMutation = useMutation({
  // 1. Función que llama al API
  mutationFn: (data) => {
    if (!token) throw new Error('No token found');
    return createCliente(token, data);
  },

  // 2. onMutate: SE EJECUTA ANTES de enviar al servidor
  onMutate: async (newData) => {
    // Cancelar queries en curso
    await queryClient.cancelQueries({ queryKey: ['clientes'] });

    // Guardar estado anterior (para rollback)
    const previous = queryClient.getQueryData(['clientes']);

    // ACTUALIZAR LA CACHÉ INMEDIATAMENTE
    queryClient.setQueryData(['clientes'], (old) => [...old, newData]);

    // Retornar contexto para onError
    return { previous };
  },

  // 3. onSuccess: Cuando el servidor responde OK
  onSuccess: () => {
    // Invalidar queries para refetch con datos reales del servidor
    queryClient.invalidateQueries({ queryKey: ['clientes'] });
    alert('✅ Operación exitosa');
  },

  // 4. onError: Si el servidor falla
  onError: (error, variables, context) => {
    // ROLLBACK: Restaurar estado anterior
    if (context?.previous) {
      queryClient.setQueryData(['clientes'], context.previous);
    }
    alert('❌ Error: ' + error.message);
  },
});
```

---

## 🎭 Comportamiento en Diferentes Escenarios

### ✅ Escenario 1: Todo funciona correctamente
```
1. Usuario hace clic en "Eliminar"
2. Fila desaparece INSTANTÁNEAMENTE de la tabla (onMutate)
3. Petición DELETE viaja al servidor (500ms)
4. Servidor responde 200 OK (onSuccess)
5. Se invalida la caché para refrescar datos reales
6. Usuario ve mensaje "✅ Cliente eliminado"
```

### ❌ Escenario 2: El servidor rechaza la operación
```
1. Usuario hace clic en "Eliminar"
2. Fila desaparece INSTANTÁNEAMENTE (onMutate)
3. Petición DELETE viaja al servidor (500ms)
4. Servidor responde 400 Bad Request (onError)
   Mensaje: "No se puede eliminar: el cliente tiene órdenes activas"
5. LA FILA VUELVE A APARECER AUTOMÁTICAMENTE (rollback)
6. Usuario ve mensaje "❌ No se puede eliminar..."
```

### 🔒 Escenario 3: Error de autenticación
```
1. Usuario hace clic en "Eliminar"
2. Fila desaparece INSTANTÁNEAMENTE (onMutate)
3. Petición DELETE viaja al servidor
4. Servidor responde 401 Unauthorized (onError)
5. Hook detecta UNAUTHORIZED
6. Borra token de localStorage
7. Redirige automáticamente a /login
```

---

## 🔗 Sincronización de Queries

Los hooks invalidan automáticamente las queries relacionadas:

### Ejemplo: Eliminar Cliente
```typescript
deleteMutation → onSuccess() → queryClient.invalidateQueries()
                               ↓
                     ┌─────────┴─────────┐
                     ↓                   ↓
            ['clientes']          ['dashboard-kpis']
         (Tabla principal)     (KPI de total clientes)
```

### Ejemplo: Ajustar Stock
```typescript
ajustarStockMutation → onSuccess() → queryClient.invalidateQueries()
                                      ↓
                        ┌─────────────┼─────────────┐
                        ↓             ↓             ↓
                 ['repuestos']  ['alertas-   ['dashboard-
                    (Tabla)     stock-bajo']  stock-bajo']
```

---

## 🎨 Estados de Mutación

Cada mutación expone estos estados:

```typescript
const { createMutation } = useClientesMutations();

createMutation.isPending   // true mientras viaja la petición
createMutation.isSuccess   // true cuando el servidor respondió OK
createMutation.isError     // true si el servidor falló
createMutation.error       // Objeto Error con el mensaje
```

**Uso en UI:**
```typescript
<button 
  onClick={() => createMutation.mutate(data)}
  disabled={createMutation.isPending}
>
  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
</button>
```

---

## 📊 Comparación: Antes vs Después

### ANTES (Sin Mutaciones Optimistas)
```typescript
const [clientes, setClientes] = useState([]);
const [loading, setLoading] = useState(false);

const handleDelete = async (id: number) => {
  setLoading(true); // ← Spinner bloqueante
  
  try {
    const response = await fetch(`/api/clientes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Error');
    
    // Actualizar estado manualmente
    setClientes(clientes.filter(c => c.id_cliente !== id));
    alert('✅ Eliminado');
  } catch (error) {
    alert('❌ Error');
  } finally {
    setLoading(false);
  }
};
```

**Problemas:**
- ❌ 40+ líneas de código boilerplate
- ❌ Spinner bloqueante (500-2000ms)
- ❌ Estado desincronizado entre componentes
- ❌ Manejo manual de errores
- ❌ Sin rollback automático

### DESPUÉS (Con Mutaciones Optimistas)
```typescript
const { deleteMutation } = useClientesMutations();

const handleDelete = (id: number) => {
  if (confirm('¿Borrar?')) {
    deleteMutation.mutate(id); // ← ¡Eso es todo!
  }
};
```

**Beneficios:**
- ✅ 3 líneas de código
- ✅ UI se actualiza instantáneamente (0ms)
- ✅ Caché sincronizada automáticamente
- ✅ Manejo de errores centralizado
- ✅ Rollback automático si falla

---

## 🚀 Próximos Pasos

1. **Prueba el ejemplo completo:**
   - Abre `EJEMPLO_MUTACIONES_OPTIMISTAS.tsx`
   - Copia el código a tu página real de clientes
   - Haz pruebas de crear/editar/eliminar

2. **Implementa en otros módulos:**
   - Usa `useOrdenesMutations` en `/admin/ordenes/page.tsx`
   - Usa `useRepuestosMutations` en `/admin/repuestos/page.tsx`

3. **Personaliza los mensajes:**
   - Cambia los `alert()` por toasts (ej: react-hot-toast)
   - Ajusta los mensajes de error según tus necesidades

4. **Observa el comportamiento:**
   - Desconecta el backend y haz clic en "Eliminar"
   - Verás cómo la fila desaparece y vuelve a aparecer (rollback)
   - Reconecta el backend y verás que funciona instantáneamente

---

## 📚 Referencias

- **Tanstack Query Docs:** https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- **Custom Hooks creados:**
  - `src/hooks/useClientesMutations.ts`
  - `src/hooks/useOrdenesMutations.ts`
  - `src/hooks/useRepuestosMutations.ts`
- **Ejemplo completo:** `src/app/admin/clientes/EJEMPLO_MUTACIONES_OPTIMISTAS.tsx`

---

## 🎉 Resultado Final

Tu aplicación ahora se siente como una **app nativa de escritorio**:

- ⚡ **0ms de latencia percibida** en todas las operaciones CRUD
- 🔒 **Robusta ante fallos** con rollback automático
- 🧹 **Código limpio** sin boilerplate de loading/error
- 🎯 **Caché sincronizada** entre todos los componentes
- 💪 **Production-ready** con manejo profesional de errores

**¡Disfruta de tu nueva UX ultra-rápida!** 🚀
