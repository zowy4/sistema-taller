/**
 * Utilidades de Formateo
 * Funciones para formatear datos en presentación de UI
 */

/**
 * Formatea un número como moneda en pesos dominicanos (DOP)
 * @param amount - El monto a formatear
 * @returns String formateado como moneda (ej: "RD$ 1,250.00")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una fecha en formato legible
 * @param date - La fecha a formatear (string ISO o Date)
 * @returns String formateado (ej: "15 de enero de 2024")
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

/**
 * Formatea una fecha y hora en formato legible
 * @param date - La fecha a formatear (string ISO o Date)
 * @returns String formateado (ej: "15 de enero de 2024, 3:30 PM")
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

/**
 * Formatea una fecha en formato corto
 * @param date - La fecha a formatear (string ISO o Date)
 * @returns String formateado (ej: "15/01/2024")
 */
export function formatShortDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj);
}

/**
 * Formatea un número de teléfono dominicano
 * @param phone - El número de teléfono (10 dígitos)
 * @returns String formateado (ej: "(809) 555-1234")
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Formatea un número con separadores de miles
 * @param num - El número a formatear
 * @returns String formateado (ej: "1,250")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-DO').format(num);
}

/**
 * Trunca un texto largo con puntos suspensivos
 * @param text - El texto a truncar
 * @param maxLength - Longitud máxima
 * @returns String truncado
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
