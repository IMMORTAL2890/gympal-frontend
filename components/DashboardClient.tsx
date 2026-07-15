'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, AlertTriangle, ShieldAlert, 
  Calendar, CreditCard, DollarSign, ArrowRight, 
  Landmark, ArrowUpRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), { ssr: false });

interface DashboardClientProps {
  stats: any;
  from: string;
  to: string;
  initialFilterType: 'month' | 'year' | 'custom';
}

export default function DashboardClient({ stats, from, to, initialFilterType }: DashboardClientProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'month' | 'year' | 'custom'>(initialFilterType);
  const [fromStr, setFromStr] = useState(from);
  const [toStr, setToStr] = useState(to);

  const formatDateString = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const handleFilterChange = (type: 'month' | 'year' | 'custom') => {
    setFilterType(type);
    const now = new Date();
    let start = '';
    let end = '';

    if (type === 'month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      start = formatDateString(s);
      end = formatDateString(e);
      setFromStr(start);
      setToStr(end);
      router.push(`/dashboard?from=${start}&to=${end}&type=month`);
    } else if (type === 'year') {
      const s = new Date(now.getFullYear(), 0, 1);
      const e = new Date(now.getFullYear(), 11, 31);
      start = formatDateString(s);
      end = formatDateString(e);
      setFromStr(start);
      setToStr(end);
      router.push(`/dashboard?from=${start}&to=${end}&type=year`);
    }
  };

  const handleCustomDateSubmit = (f: string, t: string) => {
    router.push(`/dashboard?from=${f}&to=${t}&type=custom`);
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Owner Dashboard</h1>
          <p className="text-xs text-muted-foreground">Gym overview, payments collection ledger, and active biometric metrics.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Filter Control */}
          <div className="inline-flex rounded-xl border bg-white p-1">
            <button
              onClick={() => handleFilterChange('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'month' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => handleFilterChange('year')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'year' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => handleFilterChange('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === 'custom' ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Inputs */}
          {filterType === 'custom' && (
            <div className="flex items-center gap-2 bg-white border rounded-xl p-1 animate-fade-in">
              <input
                type="date"
                value={fromStr}
                onChange={(e) => {
                  setFromStr(e.target.value);
                  handleCustomDateSubmit(e.target.value, toStr);
                }}
                className="px-2 py-1 text-xs border rounded-lg outline-none"
              />
              <span className="text-xs text-muted-foreground font-semibold">to</span>
              <input
                type="date"
                value={toStr}
                onChange={(e) => {
                  setToStr(e.target.value);
                  handleCustomDateSubmit(fromStr, e.target.value);
                }}
                className="px-2 py-1 text-xs border rounded-lg outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Members</span>
            <div className="p-1.5 rounded-lg bg-muted text-foreground"><Users className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.totalMembers}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Members</span>
            <div className="p-1.5 rounded-lg bg-success/15 text-success"><UserCheck className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.activeMembers}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiring (Week)</span>
            <div className="p-1.5 rounded-lg bg-warning/15 text-warning"><AlertTriangle className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.expiringThisWeek}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Present Today</span>
            <div className="p-1.5 rounded-lg bg-success/10 text-success"><Calendar className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.presentToday}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocked</span>
            <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.blockedMembers}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collected (Range)</span>
            <div className="p-1.5 rounded-lg bg-success/15 text-success"><Landmark className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.collected)}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billed (Range)</span>
            <div className="p-1.5 rounded-lg bg-muted text-foreground"><CreditCard className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.billed)}</span>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/members?status=dues')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due (Range)</span>
            <div className="p-1.5 rounded-lg bg-warning/15 text-warning"><DollarSign className="h-4 w-4" /></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.dueInRange)}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow lg:col-span-2 cursor-pointer" onClick={() => router.push('/members?status=dues')}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-destructive uppercase tracking-wider">Total Outstanding Dues</span>
            <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="h-4 w-4" /></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-extrabold text-destructive">{formatCurrency(stats?.totalOutstanding)}</span>
            <span className="text-xs font-bold text-destructive flex items-center gap-1">
              View members dues <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <DashboardCharts 
        timeline={stats?.timeline || []} 
        membersByPlan={stats?.membersByPlan || []} 
      />


    </div>
  );
}
