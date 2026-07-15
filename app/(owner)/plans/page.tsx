import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import PlansClient from '@/components/PlansClient';

export default async function PlansPage() {
  const plans = await serverApiClient('/plans');

  return (
    <PlansClient initialPlans={plans || []} />
  );
}
