import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import AlertsClient from '@/components/AlertsClient';

export const dynamic = 'force-dynamic';

export default async function AlertsPage() {
  let alerts = [];
  try {
    alerts = await serverApiClient('/alerts');
  } catch (error) {
    console.error("Alerts fetch error:", error);
    throw error;
  }

  return (
    <AlertsClient initialAlerts={alerts || []} />
  );
}
