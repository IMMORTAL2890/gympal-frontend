import React from 'react';
import { Dumbbell } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OwnerLayoutClient from '@/components/OwnerLayoutClient';

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

  // If the gym is not configured yet, prevent sub-page components from rendering
  // to avoid uncaught backend fetch errors (like 404 Gym Not Found) before onboarding is done.
  const childrenToRender = meData?.gym ? children : (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 border border-success/35 mb-4">
        <Dumbbell className="h-6 w-6 text-success animate-pulse-glow" />
      </div>
      <h2 className="text-md font-bold text-foreground">Welcome to FitTrack!</h2>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
        Please complete the Setup Wizard on your screen to initialize your branch profile and unlock the dashboard.
      </p>
    </div>
  );

  return (
    <OwnerLayoutClient initialMe={meData} initialAlerts={alertsData}>
      {childrenToRender}
    </OwnerLayoutClient>
  );
}
