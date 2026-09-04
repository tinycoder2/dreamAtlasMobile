import { auth } from '@/lib/firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is not configured');
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User is not signed in');
  }

  const idToken = await user.getIdToken();
  console.log(idToken);

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        Authorization: `Bearer ${idToken}`,
      },
    },
  );

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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: unknown) {
    return request<T>(path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  delete<T = void>(path: string) {
    return request<T>(path, {
      method: 'DELETE',
    });
  },
  postMultipart<T>(path: string, formData: FormData) {
    return request<T>(path, {
      method: 'POST',
      body: formData,
    });
  },
};