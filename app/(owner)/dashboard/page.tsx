import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    type?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const formatDateString = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const from = params.from || formatDateString(firstDayOfMonth);
  const to = params.to || formatDateString(lastDayOfMonth);
  const filterType = (params.type as 'month' | 'year' | 'custom') || 'month';

  let stats = null;
  try {
    stats = await serverApiClient(`/dashboard/stats?from=${from}&to=${to}`);
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    throw error;
  }

  return (
    <DashboardClient 
      stats={stats} 
      from={from} 
      to={to} 
      initialFilterType={filterType} 
    />
  );
}
