import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import AlertsClient from '@/components/AlertsClient';

export default async function AlertsPage() {
  const alerts = await serverApiClient('/alerts');

  return (
    <AlertsClient initialAlerts={alerts || []} />
  );
}
