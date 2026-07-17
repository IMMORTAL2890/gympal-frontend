import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  role: string;
}

export async function getServerTokens() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('fittrack:accessToken')?.value || null;
  const userStr = cookieStore.get('fittrack:user')?.value || null;

  let user: User | null = null;
  if (userStr) {
    try {
      user = JSON.parse(decodeURIComponent(userStr));
    } catch (e) {
      // ignore
    }
  }

  return { accessToken, user };
}

export async function setServerTokens(access: string, user: User) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('fittrack:accessToken', access, { path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'lax' });
    cookieStore.set('fittrack:user', JSON.stringify(user), { path: '/', maxAge: 7 * 24 * 60 * 60, sameSite: 'lax' });
  } catch (e) {
    // Ignore errors when called in Server Components (where cookies cannot be set)
  }
}

export async function clearServerTokens() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('fittrack:accessToken');
    cookieStore.delete('fittrack:refreshToken'); // Delete legacy refresh tokens from server cookie storage
    cookieStore.delete('fittrack:user');
  } catch (e) {
    // Ignore errors when called in Server Components
  }
}

export async function isServerAuthenticated(): Promise<boolean> {
  const { accessToken } = await getServerTokens();
  return !!accessToken;
}
