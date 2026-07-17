import React from 'react';
import { redirect } from 'next/navigation';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OpsRevenueClient from '@/components/OpsRevenueClient';

export default async function OpsRevenuePage() {
  const { accessToken, user } = await getServerTokens();
  if (!accessToken || !user || user.role !== 'ADMIN') {
    redirect('/ops-7f3k/login');
  }

  let revenue = null;
  let shouldRedirect = false;

  try {
    revenue = await serverApiClient('/admin/revenue');
  } catch (error: any) {
    console.error("Ops revenue fetch error:", error);
    if (error?.status === 401 || error?.status === 403) {
      shouldRedirect = true;
    } else {
      throw error;
    }
  }

  if (shouldRedirect) {
    redirect('/ops-7f3k/login');
  }

  return (
    <OpsRevenueClient initialRevenue={revenue} />
  );
}
