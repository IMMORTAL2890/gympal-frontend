import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import PlansClient from '@/components/PlansClient';

export const dynamic = 'force-dynamic';

export default async function PlansPage() {
  let plans = [];
  try {
    plans = await serverApiClient('/plans');
  } catch (error) {
    console.error("Plans fetch error:", error);
    throw error;
  }

  return (
    <PlansClient initialPlans={plans || []} />
  );
}
