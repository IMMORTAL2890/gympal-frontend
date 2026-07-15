import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import AttendanceClient from '@/components/AttendanceClient';

interface PageProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const date = params.date || new Date().toISOString().split('T')[0];

  const attendance = await serverApiClient(`/attendance?date=${date}`);

  return (
    <AttendanceClient initialAttendance={attendance || []} date={date} />
  );
}
