import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import TransactionsClient from '@/components/TransactionsClient';

interface PageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    mode?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const formatDateString = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const from = params.from || formatDateString(firstDayOfMonth);
  const to = params.to || formatDateString(lastDayOfMonth);
  const mode = params.mode || '';

  const modeParam = mode ? `&mode=${mode}` : '';
  let transactions = [];
  try {
    transactions = await serverApiClient(`/transactions?from=${from}&to=${to}${modeParam}`);
  } catch (error) {
    console.error("Transactions fetch error:", error);
    throw error;
  }

  return (
    <TransactionsClient
      initialTransactions={transactions || []}
      from={from}
      to={to}
      mode={mode}
    />
  );
}
