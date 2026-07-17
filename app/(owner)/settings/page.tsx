import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import SettingsClient from '@/components/SettingsClient';

export default async function SettingsPage() {
  let me = null;
  let devices = [];
  try {
    me = await serverApiClient('/me');
    devices = await serverApiClient('/devices');
  } catch (error) {
    console.error("Settings fetch error:", error);
    throw error;
  }

  return (
    <SettingsClient initialMe={me} initialDevices={devices || []} />
  );
}
