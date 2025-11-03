// Small API helper to centralize base URL, auth header and 401 handling
// Usage: const data = await api.get<T>("/ordenes")

export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:3002';

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Hard redirect to force auth flow
      window.location.href = '/login';
    }
    throw new Error('No autorizado');
  }

  if (!res.ok) {
    let message = 'Error en la solicitud';
    try {
      const err: unknown = await res.json();
      message = (err as { message?: string })?.message || JSON.stringify(err) || message;
    } catch {}
    throw new Error(message);
  }

  // Try to parse JSON, allow empty response
  const text = await res.text();
  return (text ? JSON.parse(text) : (undefined as unknown)) as T;
}

export const api = {
  get: <T = unknown>(path: string, init: RequestInit = {}) => request<T>(path, { ...init, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, init: RequestInit = {}) =>
    request<T>(path, { ...init, method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(path: string, body?: unknown, init: RequestInit = {}) =>
    request<T>(path, { ...init, method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T = unknown>(path: string, init: RequestInit = {}) => request<T>(path, { ...init, method: 'DELETE' }),
};
