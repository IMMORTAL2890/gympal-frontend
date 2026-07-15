import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import MemberDetailClient from '@/components/MemberDetailClient';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const detail = await serverApiClient(`/members/${id}`);
  const plans = await serverApiClient('/plans');

  return (
    <MemberDetailClient 
      memberId={id} 
      detail={detail} 
      plans={plans || []} 
    />
  );
}
