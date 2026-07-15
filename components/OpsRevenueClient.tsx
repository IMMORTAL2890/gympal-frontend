'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowLeft, Calendar, Download, Landmark, Loader2, BarChart3, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { clearTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface OpsRevenueClientProps {
  initialRevenue: any;
}

export default function OpsRevenueClient({ initialRevenue }: OpsRevenueClientProps) {
  const router = useRouter();
  const [revenue, setRevenue] = useState(initialRevenue);
  const [loading, setLoading] = useState(false);

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);

      const data = await apiClient(`/admin/revenue?${params.toString()}`);
      setRevenue(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch revenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [startDate, endDate]);

  const handleLogout = () => {
    clearTokens();
    toast.success('Admin logged out');
    router.push('/ops-7f3k/login');
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    
    const token = localStorage.getItem('accessToken');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1'}/admin/revenue/export?${params.toString()}`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'revenue-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  const total = revenue?.totalRevenue || 0;
  const breakdown = revenue?.gymBreakdown || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-indigo-400" />
          <span className="font-extrabold text-white text-lg tracking-wide">FitTrack <span className="text-indigo-400">Ops Console</span></span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-400">
            <button onClick={() => router.push('/ops-7f3k')} className="hover:text-white cursor-pointer">Dashboard</button>
            <button onClick={() => router.push('/ops-7f3k/users')} className="hover:text-white cursor-pointer">Users</button>
            <button onClick={() => router.push('/ops-7f3k/revenue')} className="text-white hover:text-white cursor-pointer">Revenue</button>
          </nav>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-1.5 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/ops-7f3k')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white md:text-3xl">Platform Revenue Ledger</h1>
              <p className="text-xs text-slate-400 mt-1">Consolidated collections audits and gym branch revenue shares.</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-5 cursor-pointer shadow-sm shrink-0"
          >
            <Download className="h-4 w-4" />
            Export CSV Report
          </button>
        </div>

        {/* Date Filters Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-xs text-white outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-850 bg-slate-950 py-2.5 px-3 text-xs text-white outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><Landmark className="h-6 w-6" /></div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Collection Amount</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">{formatCurrency(total)}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4 animate-fade-in">
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Branch Enrolment</div>
              <div className="text-3xl font-extrabold text-white mt-0.5">{breakdown.length} Branches</div>
            </div>
          </div>
        </div>

        {/* Chart comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Collections Share By Branch</h3>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mr-2" />
                Loading collection stats...
              </div>
            ) : breakdown.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No collections recorded in selected range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="gymName" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="revenue" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={55} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Breakdown Ledger Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Gym Branch Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Owner Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Collected Dues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {breakdown.map((b: any) => (
                  <tr key={b.gymId} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{b.gymName}</td>
                    <td className="px-6 py-4 font-semibold text-slate-300">{b.ownerName}</td>
                    <td className="px-6 py-4 font-black text-emerald-400">{formatCurrency(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
