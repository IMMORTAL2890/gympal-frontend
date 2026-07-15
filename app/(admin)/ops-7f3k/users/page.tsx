import React from 'react';
import { redirect } from 'next/navigation';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import OpsUsersClient from '@/components/OpsUsersClient';

export default async function OpsUsersPage() {
  const { accessToken, user } = await getServerTokens();
  if (!accessToken || !user || user.role !== 'ADMIN') {
    redirect('/ops-7f3k/login');
  }

  let initialUsers = [];
  let gyms = [];
  let shouldRedirect = false;

  try {
    initialUsers = await serverApiClient('/admin/users');
    gyms = await serverApiClient('/admin/gyms');
  } catch (error) {
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    redirect('/ops-7f3k/login');
  }

  return (
    <OpsUsersClient initialUsers={initialUsers || []} gyms={gyms || []} />
  );
}
