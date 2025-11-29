/**
 * Utilidades para manejo seguro de errores
 * Evita el uso de `any` en bloques catch
 */

/**
 * Extrae el mensaje de error de forma segura
 * @param error - Error desconocido capturado en catch
 * @returns Mensaje de error legible
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'Error desconocido';
}

/**
 * Verifica si el error es un error de autenticación
 * @param error - Error desconocido
 * @returns true si es error 401 o mensaje UNAUTHORIZED
 */
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message === 'UNAUTHORIZED' || message.includes('401');
}

/**
 * Verifica si el error es un error de permisos
 * @param error - Error desconocido
 * @returns true si es error 403 o mensaje FORBIDDEN
 */
export function isForbiddenError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message === 'FORBIDDEN' || message.includes('403');
}

/**
 * Maneja errores de API de forma centralizada
 * @param error - Error capturado
 * @param defaultMessage - Mensaje por defecto si no se puede extraer
 * @returns Mensaje de error formateado
 */
export function handleApiError(error: unknown, defaultMessage = 'Error en la operación'): string {
  if (isAuthError(error)) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
  }
  
  if (isForbiddenError(error)) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  const message = getErrorMessage(error);
  return message || defaultMessage;
}

/**
 * Tipo para respuestas de error de la API
 */
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Parsea una respuesta de error de fetch
 * @param response - Response de fetch
 * @returns Mensaje de error
 */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const data: ApiErrorResponse = await response.json();
    return data.message || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
}
