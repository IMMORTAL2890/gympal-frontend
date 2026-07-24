import { getAccessToken, setTokens, clearTokens } from '../auth/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

const apiCache = new Map<string, any>();

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiClient(endpoint: string, options: FetchOptions = {}): Promise<any> {
  let baseUrl = BASE_URL;
  if (!baseUrl.includes('/api/v1') && !endpoint.includes('/api/v1')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api/v1` : `${baseUrl}/api/v1`;
  }
  let url = `${baseUrl}${endpoint}`;
  url = url.replace(/([^:]\/)\/+/g, "$1");

  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    apiCache.clear();
  } else if (apiCache.has(url)) {
    return apiCache.get(url);
  }

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

  // If unauthorized, clear tokens and redirect to login
  if (response.status === 401) {
    clearTokens();
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/auth' || currentPath === '/ops-7f3k/login' || currentPath.startsWith('/reset-password');
      if (!isAuthPage) {
        const isOpsPath = currentPath.startsWith('/ops-7f3k');
        window.location.href = isOpsPath ? '/ops-7f3k/login' : '/auth';
      }
    }
    throw {
      status: 401,
      message: 'Invalid email or password',
    };
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  let result = data;

  // Check if response is wrapped in standard API envelope: { data, message, status }
  const isEnveloped = data && typeof data === 'object' && 'status' in data && 'data' in data;

  if (isEnveloped) {
    const apiStatus = data.status;
    const isOk = apiStatus >= 200 && apiStatus < 300;

    if (!isOk) {
      // Gracefully suppress gym owner resolution errors before onboarding completes
      if (data.message && data.message.includes('Gym owner ID not resolved')) {
        console.warn("[apiClient] Suppressing unresolved gym owner error during onboarding. Returning null fallback.");
        return null;
      }
      throw {
        ...data,
        status: apiStatus,
        message: data.message || `Request failed with API status ${apiStatus}`,
      };
    }

    result = data.data;
  } else if (!response.ok) {
    // Gracefully suppress gym owner resolution errors before onboarding completes
    if (data?.message && data.message.includes('Gym owner ID not resolved')) {
      console.warn("[apiClient] Suppressing unresolved gym owner error during onboarding. Returning null fallback.");
      return null;
    }
    const errorPayload = {
      ...(data || {}),
      status: response.status,
      message: data?.message || data?.error || `Request failed with status ${response.status}`,
    };
    throw errorPayload;
  }

  if (method === 'GET' && result !== null) {
    apiCache.set(url, result);
  }

  return result;
}

