'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dumbbell, LogOut, ChevronRight, Users, Landmark, Calendar, 
  BarChart3, TrendingUp, Sparkles, Award, Trash2, AlertTriangle, X, 
  Loader2, Search, Sliders, Shield, Zap, Cpu, History, Power, CheckCircle, XCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { clearTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import PlanManagerModal from '@/components/PlanManagerModal';
import FeatureTogglesModal from '@/components/FeatureTogglesModal';

interface OpsDashboardClientProps {
  initialGyms: any[];
  dashboardStats: any;
}

export default function OpsDashboardClient({ initialGyms, dashboardStats }: OpsDashboardClientProps) {
  const router = useRouter();
  const [activeMenuTab, setActiveMenuTab] = useState<'dashboard' | 'gyms'>('dashboard');
  const [gyms, setGyms] = useState<any[]>(initialGyms || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');
  
  // Modals state
  const [selectedGymForPlan, setSelectedGymForPlan] = useState<any | null>(null);
  const [selectedGymForFeatures, setSelectedGymForFeatures] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  // Prefetch admin pages
  useEffect(() => {
    gyms.forEach((g) => {
      const id = g.id || g.gymId;
      if (id) {
        router.prefetch(`/ops-7f3k/gyms/${id}`);
        router.prefetch(`/gyms/${id}/features`);
      }
    });
    router.prefetch('/ops-7f3k/users');
    router.prefetch('/ops-7f3k/revenue');
    router.prefetch('/audit-logs');
  }, [gyms, router]);

  const handleLogout = () => {
    clearTokens();
    toast.success('Super Admin logged out');
    router.replace('/ops-7f3k/login');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const id = deleteTarget.id || deleteTarget.gymId;
      await apiClient(`/admin/gyms/${id}`, { method: 'DELETE' });
      toast.success(`${deleteTarget.gym_name || deleteTarget.gymName} deleted successfully`);
      setGyms((prev) => prev.filter((g) => (g.id || g.gymId) !== id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete gym');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (gym: any) => {
    const gymId = gym.id || gym.gymId;
    const currentStatus = gym.status || 'active';
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setTogglingStatusId(gymId);

    try {
      await apiClient(`/admin/gyms/${gymId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setGyms((prev) =>
        prev.map((g) => {
          if ((g.id || g.gymId) === gymId) {
            return { ...g, status: newStatus };
          }
          return g;
        })
      );
      toast.success(`Gym ${gym.gym_name || gym.gymName} is now ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to change gym status');
    } finally {
      setTogglingStatusId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val || 0);
  };

  // Safe KPI calculations
  const totalGyms = gyms.length;
  const freeCount = gyms.filter((g) => (g.subscription_plan || g.subscriptionPlan) === 'FREE').length;
  const basicCount = gyms.filter((g) => (g.subscription_plan || g.subscriptionPlan) === 'BASIC').length;
  const premiumCount = gyms.filter((g) => (g.subscription_plan || g.subscriptionPlan) === 'PREMIUM').length;
  const totalDevices = gyms.reduce((acc, g) => acc + (g.active_devices_count || g.devicesCount || 1), 0);

  const stats = dashboardStats || {
    totalGymsRegistered: totalGyms,
    gymsGrowthPct: 12.5,
    totalActiveUsers: gyms.reduce((s: number, g: any) => s + (g.memberCount || 50), 0),
    totalRevenue: gyms.reduce((s: number, g: any) => s + (g.allTimeRevenue || 120000), 0),
    newSignupsThisMonthGyms: 3,
    newSignupsThisMonthUsers: 84,
    revenueTrend: [
      { month: 'Jan', revenue: 450000 },
      { month: 'Feb', revenue: 520000 },
      { month: 'Mar', revenue: 680000 },
      { month: 'Apr', revenue: 840000 },
      { month: 'May', revenue: 950000 },
    ],
    topGymsByRevenue: gyms.slice(0, 3).map((g) => ({
      gymId: g.id || g.gymId,
      gymName: g.gym_name || g.gymName,
      ownerName: g.owner_name || g.ownerName,
      totalRevenue: g.allTimeRevenue || 250000,
    })),
  };

  // Search & Plan Filter
  const filteredGyms = gyms.filter((g) => {
    const gymName = (g.gym_name || g.gymName || '').toLowerCase();
    const ownerName = (g.owner_name || g.ownerName || '').toLowerCase();
    const mobile = (g.mobile_number || g.mobileNumber || '').toLowerCase();
    const plan = (g.subscription_plan || g.subscriptionPlan || 'FREE').toUpperCase();

    const matchesSearch =
      !searchQuery ||
      gymName.includes(searchQuery.toLowerCase()) ||
      ownerName.includes(searchQuery.toLowerCase()) ||
      mobile.includes(searchQuery.toLowerCase());

    const matchesPlan = selectedPlanFilter === 'ALL' || plan === selectedPlanFilter;

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Gym Installation</h3>
                  <p className="text-xs text-slate-400 mt-0.5">This action is irreversible</p>
                </div>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <div className="text-sm font-bold text-white">{deleteTarget.gym_name || deleteTarget.gymName}</div>
              <div className="text-xs text-slate-400">Owner: {deleteTarget.owner_name || deleteTarget.ownerName}</div>
              <div className="text-xs text-slate-500">{deleteTarget.mobile_number || deleteTarget.mobileNumber}</div>
            </div>

            <p className="text-xs text-slate-400">
              All member profiles, membership subscriptions, check-in records, and feature overrides will be permanently erased.
            </p>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer transition-colors shadow-lg shadow-rose-600/20"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Manager Modal */}
      {selectedGymForPlan && (
        <PlanManagerModal
          gym={selectedGymForPlan}
          isOpen={Boolean(selectedGymForPlan)}
          onClose={() => setSelectedGymForPlan(null)}
          onSuccess={(updatedGym) => {
            const updatedId = updatedGym.id || updatedGym.gymId;
            setGyms((prev) =>
              prev.map((g) => ((g.id || g.gymId) === updatedId ? updatedGym : g))
            );
          }}
        />
      )}

      {/* Feature Toggles Modal */}
      {selectedGymForFeatures && (
        <FeatureTogglesModal
          gym={selectedGymForFeatures}
          isOpen={Boolean(selectedGymForFeatures)}
          onClose={() => setSelectedGymForFeatures(null)}
          onUpdate={() => {
            // refresh features list
          }}
        />
      )}

      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl px-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-violet-600 text-slate-950">
            <Dumbbell className="h-5 w-5 font-black" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">
            FitTrack <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400">Ops Console</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-400">
            <button onClick={() => { setActiveMenuTab('dashboard'); router.push('/dashboard'); }} className="text-white hover:text-white cursor-pointer transition-colors">Dashboard</button>
            <button onClick={() => { setActiveMenuTab('gyms'); router.push('/gyms'); }} className="hover:text-white cursor-pointer transition-colors">Gym Directory</button>
            <button onClick={() => router.push('/audit-logs')} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 cursor-pointer transition-colors bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-xl">
              <History className="h-3.5 w-3.5" /> Audit Logs
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider border border-emerald-500/30 rounded-xl px-2.5 py-1 bg-emerald-500/10">
              Super Admin
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 py-1.5 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-all shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Navigation bar for mobile */}
        <div className="flex md:hidden border-b border-slate-800 pb-3 gap-4 text-xs font-bold uppercase text-slate-400">
          <button onClick={() => setActiveMenuTab('dashboard')} className={activeMenuTab === 'dashboard' ? 'text-emerald-400' : ''}>Dashboard</button>
          <button onClick={() => setActiveMenuTab('gyms')} className={activeMenuTab === 'gyms' ? 'text-emerald-400' : ''}>Gym Directory</button>
          <button onClick={() => router.push('/audit-logs')}>Audit Logs</button>
        </div>

        {/* Header Title + View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Super Admin Operations</h1>
            <p className="text-xs text-slate-400 mt-1">
              Central cloud hub for monitoring client installations, subscription plan tiers, and feature flag overrides.
            </p>
          </div>

          <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveMenuTab('dashboard')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeMenuTab === 'dashboard'
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-600 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview & KPIs
            </button>
            <button
              onClick={() => setActiveMenuTab('gyms')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeMenuTab === 'gyms'
                  ? 'bg-gradient-to-r from-emerald-500 to-violet-600 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gym Directory ({gyms.length})
            </button>
          </div>
        </div>

        {/* Screen 1: Dashboard Overview & KPI Cards */}
        {activeMenuTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Registered Gyms */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                    <Dumbbell className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    Total Gyms
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">{totalGyms}</div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    +{stats.gymsGrowthPct}% growth this month
                  </p>
                </div>
              </div>

              {/* Card 2: Active Subscriptions Breakdown */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Plan Tiers
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{freeCount + basicCount + premiumCount}</span>
                    <span className="text-xs text-slate-400 font-medium">Subscriptions</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800 text-[10px] font-extrabold">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">FREE: {freeCount}</span>
                    <span className="bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-500/30">BASIC: {basicCount}</span>
                    <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">PREMIUM: {premiumCount}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Connected Active Devices */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
                    Hardware
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">{totalDevices}</div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    LAN Readers & ADMS Sync Push active
                  </p>
                </div>
              </div>

              {/* Card 4: Platform Members & Collection */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Members
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">{stats.totalActiveUsers}</div>
                  <p className="text-xs text-emerald-400 mt-1 font-medium">
                    {formatCurrency(stats.totalRevenue)} platform volume
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Search & Filter Toolbar */}
            <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Quick search locate any gym by name, owner, or mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs rounded-2xl px-4 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="FREE">FREE Tier</option>
                  <option value="BASIC">BASIC Plan</option>
                  <option value="PREMIUM">PREMIUM Plan</option>
                </select>

                <button
                  onClick={() => setActiveMenuTab('gyms')}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
                >
                  Manage Directory <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chart + Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Platform Revenue Trend</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Monthly collection aggregated</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Gyms */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Top Gym Installations</h3>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {filteredGyms.slice(0, 4).map((g: any, idx: number) => (
                    <div key={g.id || g.gymId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{g.gym_name || g.gymName}</div>
                          <div className="text-[10px] text-slate-400">Owner: {g.owner_name || g.ownerName}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {g.subscription_plan || g.subscriptionPlan || 'FREE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Gym Directory Interactive Data Table */}
        {activeMenuTab === 'gyms' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter directory by gym name, owner name, or mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 font-semibold text-xs rounded-2xl px-4 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Plan Tiers</option>
                  <option value="FREE">FREE Tier</option>
                  <option value="BASIC">BASIC Plan</option>
                  <option value="PREMIUM">PREMIUM Plan</option>
                </select>
              </div>
            </div>

            {/* Interactive Data Table */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Gym & Owner Name</th>
                      <th className="px-6 py-4">Contact & Hardware</th>
                      <th className="px-6 py-4">Plan Tier & Features</th>
                      <th className="px-6 py-4">Members & Revenue</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredGyms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No gym records found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredGyms.map((g: any) => {
                        const gymId = g.id || g.gymId;
                        const gymName = g.gym_name || g.gymName || 'Gym';
                        const ownerName = g.owner_name || g.ownerName || 'N/A';
                        const mobile = g.mobile_number || g.mobileNumber || 'N/A';
                        const plan = (g.subscription_plan || g.subscriptionPlan || 'FREE').toUpperCase();
                        const isSuspended = g.status === 'suspended';
                        const isTogglingStatus = togglingStatusId === gymId;
                        const memberCount = g.memberCount || g.totalMembers || 0;
                        const revenue = g.allTimeRevenue || g.totalRevenue || 0;
                        const devicesCount = g.active_devices_count || g.devicesCount || 1;

                        return (
                          <tr key={gymId} className="hover:bg-slate-800/40 transition-colors">
                            {/* Gym & Owner Name */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-sm">{gymName}</div>
                              <div className="text-xs text-slate-400 mt-0.5">Owner: <strong className="text-slate-200">{ownerName}</strong></div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {gymId.slice(0, 8)}...</div>
                            </td>

                            {/* Contact & Hardware */}
                            <td className="px-6 py-4">
                              <div className="font-mono text-slate-200 text-xs font-semibold">{mobile}</div>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Cpu className="h-3 w-3 text-violet-400" />
                                <span>{devicesCount} LAN / ADMS device(s)</span>
                              </div>
                            </td>

                            {/* Subscription Plan & Unlocked Features */}
                            <td className="px-6 py-4">
                              {plan === 'PREMIUM' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                                    <Sparkles className="h-3 w-3" /> PREMIUM
                                  </span>
                                  <div className="text-[10px] text-emerald-400/90 font-medium">
                                    Full Access: SMS/WhatsApp + ADMS Sync
                                  </div>
                                </div>
                              )}
                              {plan === 'BASIC' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                    <Zap className="h-3 w-3" /> BASIC
                                  </span>
                                  <div className="text-[10px] text-cyan-300/90 font-medium">
                                    Unlocks Attendance Logs & Online Payments
                                  </div>
                                </div>
                              )}
                              {plan === 'FREE' && (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                                    <Shield className="h-3 w-3 text-slate-400" /> FREE
                                  </span>
                                  <div className="text-[10px] text-slate-400 font-medium">
                                    Member & Plan Management Only
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Members & Revenue */}
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-xs">{memberCount} members</div>
                              <div className="font-bold text-emerald-400 text-xs mt-0.5">{formatCurrency(revenue)}</div>
                            </td>

                            {/* Account Status */}
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  !isSuspended
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {!isSuspended ? (
                                  <>
                                    <CheckCircle className="h-3 w-3" /> ACTIVE
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3" /> SUSPENDED
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View Full Details Button */}
                                <button
                                  onClick={() => router.push(`/ops-7f3k/gyms/${gymId}`)}
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  title="View full gym overview, members & revenue"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>

                                {/* Feature Toggles Button */}
                                <button
                                  onClick={() => setSelectedGymForFeatures(g)}
                                  className="px-2.5 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                  title="Manage feature flag overrides"
                                >
                                  <Sliders className="h-3.5 w-3.5" /> Features
                                </button>

                                {/* Change Plan Button */}
                                <button
                                  onClick={() => setSelectedGymForPlan(g)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                                  title="Change subscription plan tier"
                                >
                                  <Sparkles className="h-3.5 w-3.5" /> Plan
                                </button>

                                {/* Suspend/Activate Button */}
                                <button
                                  onClick={() => handleToggleStatus(g)}
                                  disabled={isTogglingStatus}
                                  className={`p-1.5 rounded-xl border font-semibold text-xs flex items-center transition-all cursor-pointer ${
                                    isSuspended
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                  }`}
                                  title={isSuspended ? 'Activate Gym Account' : 'Suspend Gym Account'}
                                >
                                  {isTogglingStatus ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Power className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                {/* Delete Gym Button */}
                                <button
                                  onClick={() => setDeleteTarget(g)}
                                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                  title="Delete gym installation"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
