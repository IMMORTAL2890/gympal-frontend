import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiClient(endpoint: string, options: FetchOptions = {}): Promise<any> {
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

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // If unauthorized and a refresh token exists, try to refresh silently
  if (response.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        let refreshUrl = `${baseUrl}/auth/refresh`;
        refreshUrl = refreshUrl.replace(/([^:]\/)\/+/g, "$1");
        const refreshRes = await fetch(refreshUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: getRefreshToken() }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setTokens(data.accessToken, data.refreshToken, data.user);
          isRefreshing = false;
          onRefreshed(data.accessToken);
        } else {
          isRefreshing = false;
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
          throw new Error('Session expired');
        }
      } catch (err) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
        throw err;
      }
    }

    // Queue requests while token is refreshing
    const newAccessToken = await new Promise<string>((resolve) => {
      subscribeTokenRefresh((t) => {
        resolve(t);
      });
    });

    const newConfig = {
      ...config,
      headers: {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
    };
    response = await fetch(url, newConfig);
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
