import React from 'react';
import { Dumbbell } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OwnerLayoutClient from '@/components/OwnerLayoutClient';

export const dynamic = 'force-dynamic';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { accessToken } = await getServerTokens();
  if (!accessToken) {
    redirect('/auth');
  }

  let meData = null;
  let alertsData = null;
  let shouldRedirect = false;

  try {
    meData = await serverApiClient('/me');
    if (meData?.gym) {
      alertsData = await serverApiClient('/alerts');
    }
  } catch (error: any) {
    if (error?.message === 'Session expired' || error?.status === 401 || error?.status === 403) {
      shouldRedirect = true;
    } else {
      console.error("Layout fetch error:", error);
    }
  }

  if (shouldRedirect) {
    redirect('/auth');
  }

  if (!meData?.gym) {
    redirect('/setup');
  }

  return (
    <OwnerLayoutClient initialMe={meData} initialAlerts={alertsData}>
      {children}
    </OwnerLayoutClient>
  );
}
