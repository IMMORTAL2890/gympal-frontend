import React from 'react';
import { redirect } from 'next/navigation';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OpsDashboardClient from '@/components/OpsDashboardClient';

export default async function OpsDashboardPage() {
  const { accessToken, user } = await getServerTokens();
  if (!accessToken || !user || user.role !== 'ADMIN') {
    redirect('/ops-7f3k/login');
  }

  let gyms = null;
  let stats = null;
  let shouldRedirect = false;
  try {
    gyms = await serverApiClient('/admin/gyms');
    stats = await serverApiClient('/admin/dashboard');
  } catch (error) {
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    redirect('/ops-7f3k/login');
  }

  return (
    <OpsDashboardClient initialGyms={gyms || []} dashboardStats={stats} />
  );
}
