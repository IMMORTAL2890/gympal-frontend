import React from 'react';
import { redirect } from 'next/navigation';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OpsGymDetailClient from '@/components/OpsGymDetailClient';

interface PageProps {
  params: Promise<{
    gymId: string;
  }>;
}

export default async function AdminGymDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const gymId = resolvedParams.gymId;

  const { accessToken, user } = await getServerTokens();
  if (!accessToken || !user || user.role !== 'ADMIN') {
    redirect('/ops-7f3k/login');
  }

  let gymDetail = null;
  let shouldRedirect = false;
  try {
    gymDetail = await serverApiClient(`/admin/gyms/${gymId}`);
  } catch (error) {
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    redirect('/ops-7f3k/login');
  }

  return (
    <OpsGymDetailClient gymDetail={gymDetail} />
  );
}
