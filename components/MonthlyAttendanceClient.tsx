'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar as CalendarIcon, Users, UserCheck, UserX, ChevronLeft, ChevronRight, HelpCircle, AlertTriangle, Clock, X, Info } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface MonthlyAttendanceClientProps {
  members: any[];
  initialData: any[];
  selectedMemberId: string;
  selectedMonth: string; // YYYY-MM
}

export default function MonthlyAttendanceClient({
  members,
  initialData,
  selectedMemberId,
  selectedMonth
}: MonthlyAttendanceClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation states
  const [memberId, setMemberId] = useState(selectedMemberId);
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);

  // Modal detail states
  const [selectedDayDetail, setSelectedDayDetail] = useState<any>(null);

  // Sync state adjustments with URL parameters
  const updateUrl = (newMemberId: string, newMonth: string) => {
    const params = new URLSearchParams();
    if (newMemberId) params.set('memberId', newMemberId);
    if (newMonth) params.set('month', newMonth);
    router.push(`/attendance/monthly?${params.toString()}`);
  };

  const handleMemberChange = (id: string) => {
    setMemberId(id);
    updateUrl(id, currentMonth);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    let nextYear = year;
    let nextMonth = month;

    if (direction === 'prev') {
      nextMonth = month - 1;
      if (nextMonth === 0) {
        nextMonth = 12;
        nextYear = year - 1;
      }
    } else {
      nextMonth = month + 1;
      if (nextMonth === 13) {
        nextMonth = 1;
        nextYear = year + 1;
      }
    }

    const newMonthStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
    updateUrl(memberId, newMonthStr);
  };

  // 1. Calculations for the calendar grid
  const [yearNum, monthNum] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  // 0 = Sunday, 1 = Monday, etc.
  const firstDayIndex = new Date(yearNum, monthNum - 1, 1).getDay();

  // 2. Summary stats calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthToday = new Date();
  const isCurrentMonth = currentMonthToday.getFullYear() === yearNum && (currentMonthToday.getMonth() + 1) === monthNum;

  // Tracked days (up to today if current month, or all days of month if past month, or 0 if future month)
  let trackedDays = daysInMonth;
  if (isCurrentMonth) {
    trackedDays = currentMonthToday.getDate();
  } else if (new Date(yearNum, monthNum - 1, 1) > currentMonthToday) {
    trackedDays = 0;
  }

  const presentDays = initialData?.filter((d: any) => d.has_punch).length || 0;
  // Absent days = tracked days minus days present (capped at 0)
  const absentDays = Math.max(0, trackedDays - presentDays);
  const attendanceRate = trackedDays > 0 ? Math.round((presentDays / trackedDays) * 100) : 0;

  // Average first in time calculation
  let avgFirstInTime = '-';
  const firstInLogs = initialData?.filter((d: any) => d.has_punch && d.first_in).map((d: any) => d.first_in) || [];
  if (firstInLogs.length > 0) {
    let totalSeconds = 0;
    firstInLogs.forEach((timeStr: string) => {
      const [h, m, s] = timeStr.split(':').map(Number);
      totalSeconds += h * 3600 + m * 60 + (s || 0);
    });
    const avgSeconds = Math.floor(totalSeconds / firstInLogs.length);
    const avgHour24 = Math.floor(avgSeconds / 3600);
    const avgMinute = Math.floor((avgSeconds % 3600) / 60);
    const ampm = avgHour24 >= 12 ? 'PM' : 'AM';
    const avgHour12 = avgHour24 % 12 || 12;
    avgFirstInTime = `${avgHour12}:${String(avgMinute).padStart(2, '0')} ${ampm}`;
  }

  // Find single day stats helper
  const getDayData = (dayNum: number) => {
    const dateQuery = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
    return initialData?.find((d: any) => d.date === dateQuery);
  };

  // Construct calendar grid list (including leading blanks)
  const calendarCells = [];
  // Add empty slots for first week padding
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  // Add days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const handleCellClick = (dayNum: number | null) => {
    if (!dayNum) return;
    const dayData = getDayData(dayNum);
    const cellDateStr = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
    
    if (dayData && dayData.has_punch) {
      setSelectedDayDetail({
        date: cellDateStr,
        firstIn: dayData.first_in,
        lastOut: dayData.last_out,
        totalPunches: dayData.punch_count,
        status: 'present'
      });
    } else {
      const isFuture = new Date(cellDateStr) > new Date(todayStr);
      setSelectedDayDetail({
        date: cellDateStr,
        firstIn: null,
        lastOut: null,
        totalPunches: 0,
        status: isFuture ? 'untracked' : 'absent'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Monthly Attendance</h1>
          <p className="text-xs text-muted-foreground">Analyze individual member attendance patterns across the calendar month.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/attendance"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border bg-white text-foreground py-2.5 px-4 text-xs font-bold hover:bg-muted/40 cursor-pointer shadow-sm shrink-0"
          >
            Daily View
          </Link>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white text-muted-foreground py-2.5 px-4 text-xs font-bold cursor-not-allowed shadow-sm shrink-0 opacity-50"
            disabled
          >
            Monthly view
          </button>
        </div>
      </div>

      {/* Selectors Panel */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border p-5 rounded-2xl shadow-sm">
        {/* Member Dropdown Selector */}
        <div className="w-full md:max-w-sm">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Select Member
          </label>
          <select
            value={memberId}
            onChange={(e) => handleMemberChange(e.target.value)}
            className="w-full rounded-xl border bg-background py-2.5 px-3 text-xs outline-none focus:border-primary cursor-pointer font-bold"
          >
            <option value="">-- Select Member --</option>
            {members.map((m: any) => (
              <option key={m.memberId} value={m.memberId}>
                {m.memberName} (UID: {m.biometricUid || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        {/* Month Navigation Control */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleMonthChange('prev')}
            className="p-2 rounded-xl border hover:bg-muted/40 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          
          <div className="text-sm font-extrabold text-foreground px-4 py-2 border rounded-xl bg-muted/20 min-w-[140px] text-center">
            {new Date(yearNum, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>

          <button
            onClick={() => handleMonthChange('next')}
            className="p-2 rounded-xl border hover:bg-muted/40 cursor-pointer shadow-sm"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/15 text-success"><UserCheck className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-success uppercase">Days Present</div>
            <div className="text-xl font-bold text-success mt-0.5">{presentDays} days</div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><UserX className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-destructive uppercase">Days Absent</div>
            <div className="text-xl font-bold text-destructive mt-0.5">{absentDays} days</div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><CalendarIcon className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-primary uppercase">Attendance Rate</div>
            <div className="text-xl font-bold text-primary mt-0.5">{attendanceRate}%</div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning/10 text-warning"><Clock className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-warning uppercase">Avg First In</div>
            <div className="text-xl font-bold text-warning mt-0.5">{avgFirstInTime}</div>
          </div>
        </div>
      </div>

      {/* Main Grid Calendar Container */}
      {!memberId ? (
        <div className="bg-white border rounded-2xl p-16 text-center shadow-sm">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-55" />
          <h3 className="text-md font-bold text-foreground">Select a Member</h3>
          <p className="text-xs text-muted-foreground mt-1">Please select a gym member from the dropdown above to view their monthly calendar stats.</p>
        </div>
      ) : !initialData || initialData.length === 0 ? (
        <div className="bg-white border rounded-2xl p-16 text-center shadow-sm">
          <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-55" />
          <h3 className="text-md font-bold text-foreground">No Attendance Data Found</h3>
          <p className="text-xs text-muted-foreground mt-1">No punch entries were recorded for this member in {new Date(yearNum, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          {/* Calendar Header Weekdays */}
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-extrabold text-muted-foreground uppercase py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-3 min-h-[350px]">
            {calendarCells.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} className="bg-muted/10 border border-dashed border-muted/20 rounded-xl" />;
              }

              const dayData = getDayData(dayNum);
              const isPresent = dayData?.has_punch;
              const hasOddPunches = dayData?.punch_count % 2 !== 0;

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => handleCellClick(dayNum)}
                  className={`relative flex flex-col items-center justify-between p-3 min-h-[70px] sm:min-h-[85px] border rounded-xl transition-all duration-200 cursor-pointer shadow-sm group hover:scale-[1.02] hover:shadow-md ${
                    isPresent 
                      ? 'bg-success/5 border-success/30 hover:border-success/60' 
                      : 'bg-background border-muted/40 hover:border-muted/80'
                  }`}
                >
                  {/* Top-Right Badges */}
                  <div className="absolute top-1.5 right-1.5 flex gap-1 items-center">
                    {isPresent && hasOddPunches && (
                      <span title="Odd punch count - Missed punch-out alert">
                        <AlertTriangle className="h-4 w-4 text-warning fill-warning/20 animate-pulse" />
                      </span>
                    )}
                  </div>

                  {/* Day Date number inside circle */}
                  <div className="flex items-center justify-center w-8 h-8 text-xs font-extrabold rounded-full transition-all duration-200 mt-1">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full ${
                      isPresent 
                        ? 'bg-success text-success-foreground' 
                        : 'border-2 border-muted-foreground/35 text-muted-foreground font-semibold'
                    }`}>
                      {dayNum}
                    </span>
                  </div>

                  {/* Little bottom caption */}
                  <div className="w-full text-center mt-2">
                    {isPresent ? (
                      <span className="text-[9px] font-bold text-success bg-success/15 px-1.5 py-0.5 rounded-md">
                        {dayData.punch_count} {dayData.punch_count === 1 ? 'punch' : 'punches'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-muted-foreground/60">
                        Absent
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILS DAY MODAL DIALOG */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-white border rounded-2xl shadow-2xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-md font-extrabold text-foreground">
                Attendance Details: {new Date(selectedDayDetail.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}
              </h3>
              <button onClick={() => setSelectedDayDetail(null)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-muted-foreground">Status:</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  selectedDayDetail.status === 'present' 
                    ? 'bg-success/15 text-success' 
                    : selectedDayDetail.status === 'absent'
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-muted/60 text-muted-foreground'
                }`}>
                  {selectedDayDetail.status === 'untracked' ? 'Future Date' : selectedDayDetail.status}
                </span>
              </div>

              {selectedDayDetail.status === 'present' ? (
                <>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-muted-foreground">First In:</span>
                    <span className="text-xs font-bold text-foreground">{selectedDayDetail.firstIn || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-muted-foreground">Last Out:</span>
                    <span className="text-xs font-bold text-foreground">{selectedDayDetail.lastOut || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-muted-foreground">Total Logs:</span>
                    <span className="text-xs font-bold text-foreground">{selectedDayDetail.totalPunches} punches</span>
                  </div>

                  {selectedDayDetail.totalPunches % 2 !== 0 && (
                    <div className="bg-warning/10 border border-warning/20 p-3 rounded-xl flex gap-3 text-warning text-xs font-bold mt-2">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <div>
                        This day has an odd number of logs, indicating a potential missed punch-out.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                  {selectedDayDetail.status === 'untracked' 
                    ? 'No attendance can be tracked for future dates.' 
                    : 'No punches were logged for this member on this day.'}
                </div>
              )}

              <div className="flex justify-end border-t pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
