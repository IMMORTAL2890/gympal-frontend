import React from 'react';
import { getServerTokens } from '@/lib/auth/session';
import { serverApiClient } from '@/lib/api/server-client';
import AuditLogExplorerClient from '@/components/AuditLogExplorerClient';
import { redirect } from 'next/navigation';

export default async function OpsAuditLogsPage() {
  const { accessToken, user } = await getServerTokens();
  if (!accessToken || !user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/ops-7f3k/login');
  }

  let logs = [];
  try {
    logs = await serverApiClient('/admin/audit-logs');
  } catch (error: any) {
    console.error("Ops audit logs fetch warning:", error);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AuditLogExplorerClient initialLogs={logs || []} />
      </div>
    </div>
  );
}
