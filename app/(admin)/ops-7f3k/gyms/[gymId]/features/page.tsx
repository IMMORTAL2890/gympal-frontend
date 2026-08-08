import React from 'react';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OpsGymDetailClient from '@/components/OpsGymDetailClient';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    gymId: string;
  }>;
}

export default async function OpsGymFeaturesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const gymId = resolvedParams.gymId;

  const { accessToken, user } = await getServerTokens();
  if (!accessToken || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/ops-7f3k/login');
  }

  let gymDetail = null;
  try {
    gymDetail = await serverApiClient(`/admin/gyms/${gymId}`);
  } catch (error: any) {
    console.error("Ops gym detail fetch warning:", error);
  }

  return <OpsGymDetailClient gymDetail={gymDetail} />;
}
