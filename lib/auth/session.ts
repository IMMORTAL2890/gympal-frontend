import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  role: string;
}

export async function getServerTokens() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fittrack:accessToken')?.value || null;
  const refreshToken = cookieStore.get('fittrack:refreshToken')?.value || null;
  const userStr = cookieStore.get('fittrack:user')?.value || null;

  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(decodeURIComponent(userStr));
    } catch (e) {
      // ignore
    }
  }

  return { accessToken, refreshToken, user };
}

export async function setServerTokens(access: string, refresh: string, user: User) {
  const cookieStore = await cookies();
  cookieStore.set('fittrack:accessToken', access, { path: '/', maxAge: 15 * 60, sameSite: 'lax' });
  cookieStore.set('fittrack:refreshToken', refresh, { path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'lax' });
  cookieStore.set('fittrack:user', JSON.stringify(user), { path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'lax' });
}

export async function clearServerTokens() {
  const cookieStore = await cookies();
  cookieStore.delete('fittrack:accessToken');
  cookieStore.delete('fittrack:refreshToken');
  cookieStore.delete('fittrack:user');
}

export async function isServerAuthenticated(): Promise<boolean> {
  const { accessToken } = await getServerTokens();
  return !!accessToken;
}
