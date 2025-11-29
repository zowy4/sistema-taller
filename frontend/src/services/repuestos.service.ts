/**
 * Servicio de Repuestos (Inventario)
 * 
 * Centraliza todas las peticiones relacionadas con repuestos e inventario.
 * Este módulo es crítico porque maneja el control de stock del taller.
 * 
 * Funcionalidades especiales:
 * - Ajuste de stock (+/-) para entrada/salida de piezas
 * - Cálculo de margen de ganancia (precio_venta - precio_compra)
 * - Alertas de stock bajo
 * - Gestión de ubicaciones de almacén
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

import { Repuesto, CreateRepuestoDto } from '@/types';

/**
 * Interfaz para ajuste de stock
 * Permite sumar o restar unidades del inventario
 */
export interface AjusteStockDto {
  cantidad: number; // Positivo para entrada, negativo para salida
  motivo?: string;  // Razón del ajuste (ej: "Compra", "Venta", "Pérdida")
}

// ==========================================
// CONSULTAS (GET)
// ==========================================

/**
 * Obtiene todos los repuestos con información de proveedor
 */
export async function fetchRepuestos(token: string): Promise<Repuesto[]> {
  const response = await fetch(`${API_URL}/repuestos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar repuestos');
  }

  return response.json();
}

/**
 * Obtiene un repuesto específico por ID
 */
export async function fetchRepuestoById(token: string, id: number): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar repuesto');
  }

  return response.json();
}

/**
 * Obtiene repuestos con stock bajo (stock_actual <= stock_minimo)
 */
export async function fetchStockBajo(token: string): Promise<Repuesto[]> {
  const response = await fetch(`${API_URL}/repuestos/stock-bajo`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar stock bajo');
  }

  return response.json();
}

// ==========================================
// MUTACIONES (POST, PUT, PATCH, DELETE)
// ==========================================

/**
 * Crea un nuevo repuesto en el inventario
 */
export async function createRepuesto(token: string, data: CreateRepuestoDto): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 409) throw new Error('El código de repuesto ya existe');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear repuesto');
  }

  return response.json();
}

/**
 * Actualiza un repuesto existente
 */
export async function updateRepuesto(
  token: string, 
  id: number, 
  data: Partial<CreateRepuestoDto>
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  if (response.status === 409) throw new Error('El código de repuesto ya existe');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar repuesto');
  }

  return response.json();
}

/**
 * 🔥 FUNCIÓN CRÍTICA: Ajusta el stock de un repuesto
 * 
 * Esta es la función más importante del módulo porque:
 * - Se usa constantemente en el flujo diario del taller
 * - Debe ser RÁPIDA y con feedback instantáneo
 * - Con mutación optimista, el usuario ve el cambio inmediatamente
 * 
 * @param cantidad - Positivo para entrada, negativo para salida
 * 
 * Ejemplos:
 * - ajustarStock(token, 5, { cantidad: +10, motivo: "Compra" }) → Suma 10 unidades
 * - ajustarStock(token, 5, { cantidad: -3, motivo: "Venta" }) → Resta 3 unidades
 */
export async function ajustarStock(
  token: string,
  id: number,
  ajuste: AjusteStockDto
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}/ajustar-stock`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ajuste),
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  
  if (response.status === 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Stock insuficiente');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al ajustar stock');
  }

  return response.json();
}

/**
 * Elimina un repuesto del inventario
 */
export async function deleteRepuesto(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  if (response.status === 409) throw new Error('No se puede eliminar: repuesto en uso en órdenes activas');

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar repuesto');
  }
}

// ==========================================
// UTILIDADES
// ==========================================

/**
 * Calcula el margen de ganancia de un repuesto
 */
export function calcularMargenGanancia(precio_compra: number, precio_venta: number): number {
  if (precio_compra === 0) return 0;
  return ((precio_venta - precio_compra) / precio_compra) * 100;
}

/**
 * Determina el estado del stock de un repuesto
 */
export function getStockStatus(stock_actual: number, stock_minimo: number): 'ok' | 'bajo' | 'agotado' {
  if (stock_actual === 0) return 'agotado';
  if (stock_actual <= stock_minimo) return 'bajo';
  return 'ok';
}
