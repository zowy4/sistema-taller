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
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message === 'UNAUTHORIZED' || message.includes('401');
}
export function isForbiddenError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message === 'FORBIDDEN' || message.includes('403');
}
export function handleApiError(error: unknown, defaultMessage = 'Error en la operació³n'): string {
  if (isAuthError(error)) {
    return 'Sesió³n expirada. Por favor, inicia sesió³n nuevamente.';
  }
  if (isForbiddenError(error)) {
    return 'No tienes permisos para realizar esta acció³n.';
  }
  const message = getErrorMessage(error);
  return message || defaultMessage;
}
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}
export async function parseApiError(response: Response): Promise<string> {
  try {
    const data: ApiErrorResponse = await response.json();
    return data.message || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}: ${response.statusText}`;
  }
}
