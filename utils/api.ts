export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pg_token');
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json().catch(() => ({})) : ({} as any);

  if (!res.ok) {
    const message = (payload && (payload.message as string)) || `Request failed with ${res.status}`;
    const error = new Error(message) as Error & { status?: number; details?: any };
    (error as any).status = res.status;
    (error as any).details = (payload as any)?.details;
    throw error;
  }
  return payload as T;
}

