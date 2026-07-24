'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, AlertTriangle, ShieldAlert, 
  Calendar, CreditCard, DollarSign, ArrowRight, 
  Landmark, ArrowUpRight, Info
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
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

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

      {/* Click outside dismissal layer */}
      {activeTooltip && (
        <div 
          className="fixed inset-0 z-30 bg-transparent" 
          onClick={() => setActiveTooltip(null)}
        />
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Members */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Members</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'total' ? null : 'total'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-muted text-foreground"><Users className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.totalMembers}</span>
          </div>
          {activeTooltip === 'total' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              The total count of all members registered in your database.
            </div>
          )}
        </div>

        {/* Active Members */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Members</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'active' ? null : 'active'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-success/15 text-success"><UserCheck className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.activeMembers}</span>
          </div>
          {activeTooltip === 'active' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Members currently holding an active or expiring membership plan.
            </div>
          )}
        </div>

        {/* Expiring (Week) */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expiring (Week)</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'expiring' ? null : 'expiring'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-warning/15 text-warning"><AlertTriangle className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.expiringThisWeek}</span>
          </div>
          {activeTooltip === 'expiring' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Members whose plans are ending within the next 7 days.
            </div>
          )}
        </div>

        {/* Present Today */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Present Today</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'present' ? null : 'present'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-success/10 text-success"><Calendar className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.presentToday}</span>
          </div>
          {activeTooltip === 'present' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Number of members checked in today.
            </div>
          )}
        </div>

        {/* Blocked */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blocked</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'blocked' ? null : 'blocked'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{stats?.blockedMembers}</span>
          </div>
          {activeTooltip === 'blocked' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Members manually flagged as blocked from entering the gym.
            </div>
          )}
        </div>

        {/* Collected (Range) */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collected (Range)</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'collected' ? null : 'collected'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-success/15 text-success"><Landmark className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.collected)}</span>
          </div>
          {activeTooltip === 'collected' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Total subscription fees actually paid/collected within the filtered date range.
            </div>
          )}
        </div>

        {/* Billed (Range) */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billed (Range)</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'billed' ? null : 'billed'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-muted text-foreground"><CreditCard className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.billed)}</span>
          </div>
          {activeTooltip === 'billed' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Total subscription fees billed/invoiced within the filtered date range.
            </div>
          )}
        </div>

        {/* Due (Range) */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/members?status=dues')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due (Range)</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'due' ? null : 'due'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-warning/15 text-warning"><DollarSign className="h-4 w-4" /></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">{formatCurrency(stats?.dueInRange)}</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
          {activeTooltip === 'due' && (
            <div className="absolute top-12 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Outstanding dues accrued for memberships started within the filtered date range.
            </div>
          )}
        </div>

        {/* Total Outstanding Dues */}
        <div className="relative bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow lg:col-span-2 cursor-pointer" onClick={() => router.push('/members?status=dues')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-destructive uppercase tracking-wider">Total Outstanding Dues</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'outstanding' ? null : 'outstanding'); }}
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
            <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive"><ShieldAlert className="h-4 w-4" /></div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-extrabold text-destructive">{formatCurrency(stats?.totalOutstanding)}</span>
            <span className="text-xs font-bold text-destructive flex items-center gap-1">
              View members dues <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          {activeTooltip === 'outstanding' && (
            <div className="absolute top-16 left-5 right-5 z-40 bg-slate-800 text-white text-[10px] p-2.5 rounded-xl border border-slate-700 shadow-lg leading-normal animate-fade-in">
              Grand total of all unpaid membership balances across the entire history.
            </div>
          )}
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
