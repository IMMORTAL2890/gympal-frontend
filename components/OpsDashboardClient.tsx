'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, LogOut, ChevronRight, Users, Landmark, Calendar, BarChart3, TrendingUp, Sparkles, Award } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { clearTokens } from '@/lib/auth/auth-store';
import { toast } from 'sonner';

interface OpsDashboardClientProps {
  initialGyms: any[];
  dashboardStats: any;
}

export default function OpsDashboardClient({ initialGyms, dashboardStats }: OpsDashboardClientProps) {
  const router = useRouter();
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'gyms'>('dashboard');

  const handleLogout = () => {
    clearTokens();
    toast.success('Admin logged out');
    router.push('/ops-7f3k/login');
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  // Safe fallback values
  const stats = dashboardStats || {
    totalGymsRegistered: initialGyms?.length || 0,
    gymsGrowthPct: 0.0,
    totalActiveUsers: initialGyms?.reduce((s, g) => s + g.memberCount, 0) || 0,
    totalRevenue: initialGyms?.reduce((s, g) => s + g.allTimeRevenue, 0) || 0,
    newSignupsThisMonthGyms: 0,
    newSignupsThisMonthUsers: 0,
    revenueTrend: [],
    topGymsByRevenue: []
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-indigo-400 animate-pulse-glow" />
          <span className="font-extrabold text-white text-lg tracking-wide">FitTrack <span className="text-indigo-400">Ops Console</span></span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-wider text-slate-400">
            <button onClick={() => router.push('/ops-7f3k')} className="text-white hover:text-white cursor-pointer">Dashboard</button>
            <button onClick={() => router.push('/ops-7f3k/users')} className="hover:text-white cursor-pointer">Users</button>
            <button onClick={() => router.push('/ops-7f3k/revenue')} className="hover:text-white cursor-pointer">Revenue</button>
          </nav>

          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider border border-slate-850 rounded-lg px-2 py-1 bg-slate-900">
            Role: super-admin
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-1.5 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Navigation for Mobile */}
        <div className="flex md:hidden border-b border-slate-800 pb-3 gap-4 text-xs font-bold uppercase text-slate-400">
          <button onClick={() => router.push('/ops-7f3k')} className="text-indigo-400">Dashboard</button>
          <button onClick={() => router.push('/ops-7f3k/users')}>Users</button>
          <button onClick={() => router.push('/ops-7f3k/revenue')}>Revenue</button>
        </div>

        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">Platform Command</h1>
            <p className="text-xs text-slate-400 mt-1">Aggregated statistics, branch subscriptions, and system-wide collection streams.</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setActiveMenuTab('dashboard')} className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeMenuTab === 'dashboard' ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}>
              Analytics Overview
            </button>
            <button onClick={() => setActiveMenuTab('gyms')} className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeMenuTab === 'gyms' ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}>
              Registered Branches
            </button>
          </div>
        </div>

        {activeMenuTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Aggregates Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><Dumbbell className="h-6 w-6" /></div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Registered Gyms</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{stats.totalGymsRegistered} Branches</div>
                  <div className="text-[9px] font-bold text-indigo-400 mt-1 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    +{stats.gymsGrowthPct.toFixed(1)}% growth
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><Users className="h-6 w-6" /></div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Active Customers</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{stats.totalActiveUsers} Members</div>
                  <div className="text-[9px] font-bold text-slate-450 mt-1">across all branches</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400"><Landmark className="h-6 w-6" /></div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Platform Collection</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-[9px] font-bold text-teal-450 mt-1">all-time revenue</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400"><Sparkles className="h-6 w-6" /></div>
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">New Signups (Month)</div>
                  <div className="text-2xl font-bold text-white mt-0.5">+{stats.newSignupsThisMonthUsers} Users</div>
                  <div className="text-[9px] font-bold text-violet-400 mt-1">+{stats.newSignupsThisMonthGyms} gyms added</div>
                </div>
              </div>
            </div>

            {/* Chart + Top Gyms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Platform Revenue Trend */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Platform Revenue trend</h3>
                </div>

                <div className="h-64">
                  {stats.revenueTrend?.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No collections recorded.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Leaderboard Top Gyms */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Top Branches By Collection</h3>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {stats.topGymsByRevenue?.map((g: any, idx: number) => (
                    <div key={g.gymId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-white">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{g.gymName}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Owner: {g.ownerName}</div>
                        </div>
                      </div>
                      <div className="text-xs font-black text-emerald-400">{formatCurrency(g.totalRevenue)}</div>
                    </div>
                  ))}
                  {(!stats.topGymsByRevenue || stats.topGymsByRevenue.length === 0) && (
                    <div className="py-12 text-center text-xs text-slate-400 font-semibold">No performance data mapped yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenuTab === 'gyms' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Gym Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Owner / Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subscription Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">All-Time Revenue</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {initialGyms?.map((g: any) => (
                    <tr
                      key={g.gymId}
                      onClick={() => router.push(`/ops-7f3k/gyms/${g.gymId}`)}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold text-white">{g.gymName}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-300">{g.ownerName}</div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{g.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-350">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                          {g.subscriptionPlan || 'BASIC'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-300">{g.memberCount} members</td>
                      <td className="px-6 py-4 font-bold text-emerald-400">{formatCurrency(g.allTimeRevenue)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          g.status === 'active' 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/15 text-rose-450 border border-rose-500/30'
                        }`}>
                          {g.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-400 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
