import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import SettingsClient from '@/components/SettingsClient';

export default async function SettingsPage() {
  const me = await serverApiClient('/me');
  const devices = await serverApiClient('/devices');

  return (
    <SettingsClient initialMe={me} initialDevices={devices || []} />
  );
}
