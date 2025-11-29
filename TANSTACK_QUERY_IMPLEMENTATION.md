# Implementación de Tanstack Query - Sistema Taller

## 📋 Resumen de Cambios

Se ha implementado **Tanstack Query (React Query)** para profesionalizar el manejo de datos en el frontend, eliminando todas las malas prácticas identificadas.

---

## ✅ Mejoras Implementadas

### 1. **Instalación de Dependencias**
```bash
npm install @tanstack/react-query
```

### 2. **Configuración Global (QueryProvider)**
**Archivo:** `src/providers/QueryProvider.tsx`

- **staleTime**: 60 segundos (datos se consideran frescos durante 1 minuto)
- **refetchOnWindowFocus**: false (no recargar al cambiar de pestaña)
- **retry**: 1 (solo un reintento en caso de error)
- **gcTime**: 5 minutos (tiempo en caché)

### 3. **Integración en el Layout**
**Archivo:** `src/components/ClientProviders.tsx`

Estructura de proveedores:
```
QueryProvider (Caché y fetching)
  └── AuthProvider (Autenticación)
      └── App
```

### 4. **Servicios Centralizados**

#### `src/services/dashboard.service.ts`
- `fetchDashboardKPIs()` - Obtener KPIs del dashboard
- `fetchStockBajo()` - Productos con stock bajo
- `fetchVentasSemana()` - Ventas de la última semana

#### `src/services/clientes.service.ts`
- `fetchClientes()` - Obtener todos los clientes
- `fetchClienteById()` - Cliente por ID
- `createCliente()` - Crear nuevo cliente
- `updateCliente()` - Actualizar cliente
- `deleteCliente()` - Eliminar cliente

### 5. **Refactorización del Dashboard**
**Archivo:** `src/app/admin/dashboard/page.tsx`

**Antes (Malas Prácticas):**
```typescript
// ❌ useEffect + fetch manual
// ❌ setState manual (loading, error, data)
// ❌ Sin caché
// ❌ Sin deduplicación
useEffect(() => {
  fetchDashboardData();
}, []);
```

**Después (Buenas Prácticas):**
```typescript
// ✅ useQuery automático
// ✅ Estados manejados por la librería
// ✅ Caché inteligente
// ✅ Deduplicación automática
const { data, isLoading, isError } = useQuery({
  queryKey: ['dashboard-kpis'],
  queryFn: () => fetchDashboardKPIs(token!),
  enabled: !!token && !!user,
});
```

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes (Malas Prácticas) | Después (Tanstack Query) |
|---------|-------------------------|--------------------------|
| **Obtener datos** | Manualmente con `useEffect` + `fetch` | Automático con `useQuery` |
| **Estado de carga** | `const [loading, setLoading] = useState(true)` | `const { isLoading } = useQuery(...)` |
| **Estado de error** | `const [error, setError] = useState(null)` | `const { isError, error } = useQuery(...)` |
| **Caché** | ❌ Sin caché (recarga todo cada vez) | ✅ 60s staleTime + 5min caché |
| **Duplicación** | ❌ Múltiples peticiones si se remonta rápido | ✅ Deduplicación automática |
| **Revalidación** | ❌ Manual con `useEffect` dependencies | ✅ Automática en segundo plano |
| **Código** | ~40 líneas por componente | ~10 líneas por componente |

---

## 🎯 Beneficios Obtenidos

### 1. **Rendimiento**
- ✅ Los datos persisten en caché al navegar entre páginas
- ✅ Revalidación en segundo plano sin bloquear la UI
- ✅ Menos peticiones HTTP innecesarias

### 2. **Experiencia de Usuario**
- ✅ Carga instantánea de datos cacheados
- ✅ Skeleton loaders mientras carga
- ✅ Manejo elegante de errores (401, 403, etc.)

### 3. **Mantenibilidad del Código**
- ✅ Servicios centralizados y reutilizables
- ✅ Menos código repetitivo
- ✅ Tipado fuerte con TypeScript
- ✅ Separación de responsabilidades

---

## 🔧 Estructura de Archivos

```
frontend/
├── src/
│   ├── providers/
│   │   └── QueryProvider.tsx         ← Configuración global de Tanstack Query
│   ├── services/
│   │   ├── dashboard.service.ts      ← Funciones de API para dashboard
│   │   └── clientes.service.ts       ← Funciones de API para clientes
│   ├── components/
│   │   └── ClientProviders.tsx       ← Envuelve QueryProvider + AuthProvider
│   └── app/
│       └── admin/
│           └── dashboard/
│               └── page.tsx          ← Dashboard refactorizado con useQuery
```

---

## 🚀 Próximos Pasos Sugeridos

### Refactorizar más páginas:
1. **Clientes** (`/admin/clientes/page.tsx`)
2. **Órdenes** (`/admin/ordenes/page.tsx`)
3. **Repuestos** (`/admin/repuestos/page.tsx`)
4. **Facturas** (`/admin/facturas/page.tsx`)

### Crear servicios para:
- `ordenes.service.ts`
- `repuestos.service.ts`
- `facturas.service.ts`
- `vehiculos.service.ts`

---

## 📝 Ejemplo de Uso

### Para cualquier página que necesite datos:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchClientes } from '@/services/clientes.service';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientesPage() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  const { 
    data: clientes, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => fetchClientes(token!),
    enabled: !!token && !!user,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div>
      {clientes.map(cliente => (
        <ClienteCard key={cliente.id_cliente} cliente={cliente} />
      ))}
    </div>
  );
}
```

---

## 🐳 Compatibilidad con Docker

Esta implementación es **100% compatible** con tu configuración actual de Docker:

- ✅ No requiere cambios en `docker-compose.yml`
- ✅ No requiere cambios en los `Dockerfile`
- ✅ Tanstack Query es puramente lógica de cliente (browser)
- ✅ Funciona igual en desarrollo y producción

---

## 📚 Documentación

- [Tanstack Query Official Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
- [React Query Tutorial](https://tanstack.com/query/latest/docs/framework/react/guides/queries)
- [Best Practices](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)

---

## ✨ Resultado Final

**Dashboard refactorizado:**
- ⚡ Carga instantánea con caché
- 🔄 Revalidación automática en segundo plano
- 🎨 Skeleton loaders profesionales
- ❌ Manejo elegante de errores 401/403
- 📊 Tres queries independientes (KPIs, Stock Bajo, Ventas)
- 🧪 Código limpio y fácil de testear

---

**Fecha de implementación:** 21 de noviembre de 2025
**Status:** ✅ Completado
