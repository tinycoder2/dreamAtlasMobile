const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const USER_ID = 'user123';

if (!API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not configured');
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `API ${response.status}: ${body || response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get<T>(path: string) {
    return request<T>(path);
  },

  post<T>(path: string, body: unknown) {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: unknown) {
    return request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete<T = void>(path: string) {
    return request<T>(path, {
      method: 'DELETE',
    });
  },
};