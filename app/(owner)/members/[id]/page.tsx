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

  let detail = null;
  let plans = [];
  try {
    detail = await serverApiClient(`/members/${id}`);
    plans = await serverApiClient('/plans');
  } catch (error) {
    console.error("Member detail fetch error:", error);
    throw error;
  }

  return (
    <MemberDetailClient 
      memberId={id} 
      detail={detail} 
      plans={plans || []} 
    />
  );
}
