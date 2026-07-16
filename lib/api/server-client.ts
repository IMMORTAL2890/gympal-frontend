import { getServerTokens, setServerTokens, clearServerTokens } from '../auth/session';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function serverApiClient(endpoint: string, options: FetchOptions = {}): Promise<any> {
  let baseUrl = BASE_URL;
  if (!baseUrl.includes('/api/v1') && !endpoint.includes('/api/v1')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api/v1` : `${baseUrl}/api/v1`;
  }
  let url = `${baseUrl}${endpoint}`;
  url = url.replace(/([^:]\/)\/+/g, "$1");
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  const { accessToken, refreshToken } = await getServerTokens();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // Server-side silent JWT renewal
  if (response.status === 401 && refreshToken) {
    try {
      let refreshUrl = `${baseUrl}/auth/refresh`;
      refreshUrl = refreshUrl.replace(/([^:]\/)\/+/g, "$1");
      const refreshRes = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        await setServerTokens(data.accessToken, data.refreshToken, data.user);
        
        // Retry original request with new token
        const newConfig = {
          ...config,
          headers: {
            ...headers,
            Authorization: `Bearer ${data.accessToken}`,
          },
        };
        response = await fetch(url, newConfig);
      } else {
        await clearServerTokens();
        throw new Error('Session expired');
      }
    } catch (err) {
      await clearServerTokens();
      throw err;
    }
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw data || { message: 'An error occurred' };
  }

  return data;
}
