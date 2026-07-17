import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import MembersListClient from '@/components/MembersListClient';

interface PageProps {
  searchParams: Promise<{
    query?: string;
    status?: string;
    dues?: string;
  }>;
}

export default async function MembersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.query || '';
  const status = params.status || 'all';
  const dues = params.dues === '1';

  const duesParam = dues ? '&dues=1' : '';
  let members = [];
  try {
    members = await serverApiClient(`/members?query=${encodeURIComponent(query)}&status=${status}${duesParam}`);
  } catch (error) {
    console.error("Members fetch error:", error);
    throw error;
  }

  return (
    <MembersListClient
      initialMembers={members || []}
      initialQuery={query}
      initialStatus={status}
      initialSortByDues={dues}
    />
  );
}
