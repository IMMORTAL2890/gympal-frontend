export interface User {
  id: string;
  email: string;
  role: string;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
}

function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return getCookie('fittrack:accessToken');
}

export function getUser(): User | null {
  const userStr = getCookie('fittrack:user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setTokens(access: string, user: User) {
  // Access token cookie lives for 7 days now
  setCookie('fittrack:accessToken', access, 7 * 24 * 60 * 60);
  setCookie('fittrack:user', JSON.stringify(user), 7 * 24 * 60 * 60);
}

export function clearTokens() {
  deleteCookie('fittrack:accessToken');
  deleteCookie('fittrack:refreshToken'); // Automatically clean up old legacy refresh token cookies
  deleteCookie('fittrack:user');
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
