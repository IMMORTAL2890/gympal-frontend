import React from 'react';
import { serverApiClient } from '@/lib/api/server-client';
import MonthlyAttendanceClient from '@/components/MonthlyAttendanceClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    memberId?: string;
    month?: string;
  }>;
}

export default async function MonthlyAttendancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Format current month: YYYY-MM
  const today = new Date();
  const defaultMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const month = params.month || defaultMonth;

  // 1. Fetch all members using the daily attendance endpoint to get member list
  const todayDateStr = today.toISOString().split('T')[0];
  let membersList: any[] = [];
  try {
    membersList = await serverApiClient(`/attendance?date=${todayDateStr}`) || [];
  } catch (error) {
    console.error("Monthly attendance: member fetch error:", error);
  }

  // Determine selected member id (default to first member if not provided)
  const resolvedMemberId = params.memberId || (membersList.length > 0 ? String(membersList[0].memberId) : '');

  // 2. Fetch monthly data if a member is selected
  let monthlyData: any[] = [];
  if (resolvedMemberId) {
    try {
      monthlyData = await serverApiClient(`/attendance/monthly?member_id=${resolvedMemberId}&month=${month}`) || [];
    } catch (error) {
      console.error("Monthly attendance: data fetch error:", error);
    }
  }

  return (
    <MonthlyAttendanceClient
      members={membersList}
      initialData={monthlyData}
      selectedMemberId={resolvedMemberId}
      selectedMonth={month}
    />
  );
}
