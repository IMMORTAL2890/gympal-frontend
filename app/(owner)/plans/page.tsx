import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import PlansClient from '@/components/PlansClient';

export default async function PlansPage() {
  let plans = [];
  try {
    plans = await serverApiClient('/plans');
  } catch (error) {
    console.error("Plans fetch error:", error);
  }

  return (
    <PlansClient initialPlans={plans || []} />
  );
}
