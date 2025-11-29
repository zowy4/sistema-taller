# 🚀 Sistema de Notificaciones con Sonner

## ✅ Implementación Completada

Hemos integrado **Sonner** - la librería de toasts más moderna y performante para React.

### 📦 Características

- ✅ **Toasts no bloqueantes** - No interrumpen el flujo del usuario (vs `alert()`)
- ✅ **Rich colors** - Verde para success, rojo para error, amarillo para warning
- ✅ **Animaciones fluidas** - Slide-in/out suaves
- ✅ **Posición configurable** - Top-right por defecto
- ✅ **Duración automática** - 4 segundos, con botón de cerrar
- ✅ **Descripción opcional** - Mensaje principal + detalles

---

## 🎨 Ejemplos de Uso

### Success Toast
```typescript
import { toast } from 'sonner';

toast.success('Cliente creado correctamente', {
  description: 'Juan Pérez',
});
```
**Resultado:** Toast verde con ícono ✅

### Error Toast
```typescript
toast.error('Error al eliminar cliente', {
  description: 'El cliente tiene órdenes activas',
});
```
**Resultado:** Toast rojo con ícono ❌

### Warning Toast
```typescript
toast.warning('Stock bajo', {
  description: 'Repuesto X tiene solo 3 unidades',
});
```
**Resultado:** Toast amarillo con ícono ⚠️

### Info Toast
```typescript
toast.info('Actualización disponible', {
  description: 'Versión 2.0 lista para instalar',
});
```
**Resultado:** Toast azul con ícono ℹ️

### Loading Toast (Promesas)
```typescript
toast.promise(
  fetch('/api/clientes'),
  {
    loading: 'Cargando clientes...',
    success: 'Clientes cargados',
    error: 'Error al cargar',
  }
);
```
**Resultado:** Toast que cambia automáticamente según el estado

---

## 📂 Archivos Modificados

### 1. `src/components/ClientProviders.tsx`
```typescript
import { Toaster } from 'sonner';

<Toaster 
  position="top-right"
  expand={false}
  richColors
  closeButton
  duration={4000}
/>
```

### 2. `src/hooks/useClientesMutations.ts`
```typescript
// ❌ ANTES
if (typeof window !== 'undefined') {
  alert('✅ Cliente creado correctamente');
}

// ✅ AHORA
toast.success('Cliente creado correctamente', {
  description: `${newCliente.nombre} ${newCliente.apellido}`,
});
```

### 3. `src/hooks/useOrdenesMutations.ts`
```typescript
// ❌ ANTES
alert('❌ Error al crear orden: ' + error.message);

// ✅ AHORA
toast.error('Error al crear orden', {
  description: error.message,
});
```

### 4. `src/hooks/useRepuestosMutations.ts`
```typescript
// ❌ ANTES
alert('❌ Stock insuficiente para realizar la operación');

// ✅ AHORA
toast.error('Stock insuficiente', {
  description: 'No hay suficiente stock para realizar la operación',
});
```

---

## 🎯 Mejoras vs `alert()`

| Aspecto | `alert()` | Sonner |
|---------|-----------|--------|
| **Bloquea UI** | ✅ Sí (hilo principal) | ❌ No |
| **Apariencia** | Nativa del OS (fea) | Moderna y personalizable |
| **Múltiples notificaciones** | ❌ Solo 1 a la vez | ✅ Stack infinito |
| **Duración** | Hasta que usuario cierre | Auto-dismiss en 4s |
| **Animaciones** | ❌ Ninguna | ✅ Suaves y fluidas |
| **Descripción** | ❌ No soportada | ✅ Título + descripción |
| **Acciones** | ❌ Solo OK | ✅ Botones custom |
| **Accesibilidad** | ⚠️ Limitada | ✅ ARIA completo |

---

## 🔥 Patrones Avanzados

### 1. Toast con Acción
```typescript
toast('Orden completada', {
  description: 'Orden #123 lista para facturar',
  action: {
    label: 'Ver factura',
    onClick: () => router.push('/admin/facturas/123'),
  },
});
```

### 2. Toast Persistente (no auto-dismiss)
```typescript
toast.error('Sesión expirada', {
  description: 'Por favor, inicia sesión nuevamente',
  duration: Infinity,
});
```

### 3. Toast con ID (para actualizar)
```typescript
const toastId = toast.loading('Subiendo archivo...');

// Después...
toast.success('Archivo subido', { id: toastId });
```

### 4. Cerrar Toast Programáticamente
```typescript
const toastId = toast.info('Procesando...');

// Después...
toast.dismiss(toastId);
```

### 5. Toast Personalizado (Custom JSX)
```typescript
toast.custom((t) => (
  <div className="bg-white p-4 rounded shadow-lg">
    <strong>Cliente nuevo</strong>
    <p>Juan Pérez se registró</p>
    <button onClick={() => toast.dismiss(t)}>Cerrar</button>
  </div>
));
```

---

## 🎨 Configuración Personalizada

### Cambiar Posición
```typescript
<Toaster position="bottom-center" />
// Opciones: top-left, top-center, top-right,
//           bottom-left, bottom-center, bottom-right
```

### Cambiar Tema
```typescript
<Toaster theme="dark" />
// Opciones: light, dark, system (auto)
```

### Limitar Toasts Visibles
```typescript
<Toaster visibleToasts={3} />
// Solo muestra 3 a la vez, el resto se encola
```

### Expandir Automáticamente
```typescript
<Toaster expand={true} />
// Los toasts se expanden para mostrar toda la descripción
```

---

## 🚀 Integración con Mutaciones Optimistas

### Flujo Completo
```typescript
const { deleteMutation } = useClientesMutations();

const handleDelete = (cliente: Cliente) => {
  // 1. Confirmación con toast
  toast.info('¿Eliminar cliente?', {
    description: `${cliente.nombre} ${cliente.apellido}`,
    action: {
      label: 'Confirmar',
      onClick: () => {
        // 2. Mutación optimista
        deleteMutation.mutate(cliente.id_cliente);
        
        // 3. Toast de éxito/error se muestra automáticamente
        //    gracias a los hooks refactorizados
      },
    },
  });
};
```

**Resultado:**
1. Toast azul de confirmación con botón
2. Al hacer clic: Cliente desaparece INMEDIATAMENTE
3. Toast verde "Cliente eliminado correctamente"
4. Si falla: Cliente reaparece + Toast rojo con error

---

## 📊 Comparación: Antes vs Después

### ANTES (con alert)
```typescript
const handleCreate = async () => {
  try {
    await createCliente(data);
    alert('✅ Cliente creado');  // ← Bloquea toda la UI
  } catch (err) {
    alert('❌ Error: ' + err);  // ← Usuario debe cerrar
  }
};
```

**Problemas:**
- ❌ Usuario no puede hacer nada hasta cerrar el alert
- ❌ Si hay múltiples operaciones, alertas en cadena
- ❌ Aspecto anticuado (nativo del OS)

### AHORA (con Sonner)
```typescript
const { createMutation } = useClientesMutations();

const handleCreate = () => {
  createMutation.mutate(data);
  // ✅ Toast aparece automáticamente
  // ✅ Usuario puede seguir trabajando
  // ✅ Se cierra solo en 4 segundos
};
```

**Beneficios:**
- ✅ UI nunca se bloquea
- ✅ Stack de notificaciones (múltiples toasts)
- ✅ Aspecto moderno y profesional

---

## 🎉 Resultado Final

Tu aplicación ahora tiene notificaciones al nivel de:

- ✨ **Vercel Dashboard** - Toasts fluidos y elegantes
- ✨ **Linear** - Feedback instantáneo sin bloquear
- ✨ **Notion** - Stack de notificaciones no invasivas

**¡UX profesional completada!** 🚀

---

## 📚 Referencias

- **Sonner Docs:** https://sonner.emilkowal.ski/
- **GitHub:** https://github.com/emilkowalski/sonner
- **Demo Interactiva:** https://sonner.emilkowal.ski/demo
