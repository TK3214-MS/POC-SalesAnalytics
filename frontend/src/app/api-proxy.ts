const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:7071/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const { method = 'GET', headers = {}, body } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: unknown) => request(endpoint, { method: 'POST', body }),
  put: (endpoint: string, body: unknown) => request(endpoint, { method: 'PUT', body }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};
