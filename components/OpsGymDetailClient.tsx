'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dumbbell, ArrowLeft, Users, UserCheck, Landmark, BarChart3, 
  ShieldAlert, ToggleLeft, ToggleRight, Loader2, Save, Sparkles, RefreshCcw, Power, CheckCircle, XCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface OpsGymDetailClientProps {
  gymDetail: any;
}

export default function OpsGymDetailClient({ gymDetail: initialDetail }: OpsGymDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'revenue' | 'features'>('overview');
  const [gymDetail, setGymDetail] = useState(initialDetail);
  
  const gymId = gymDetail?.gymId || gymDetail?.id;
  const gymName = gymDetail?.gymName || gymDetail?.gym_name || 'Gym Details';
  const ownerName = gymDetail?.ownerName || gymDetail?.owner_name || 'N/A';
  const mobileNumber = gymDetail?.mobileNumber || gymDetail?.mobile_number || 'N/A';

  // Gym level states
  const [status, setStatus] = useState(gymDetail?.status || 'active');
  const [subscriptionPlan, setSubscriptionPlan] = useState(
    gymDetail?.subscriptionPlan || gymDetail?.subscription_plan || 'BASIC'
  );
  const [savingGym, setSavingGym] = useState(false);

  // Features list state
  const [features, setFeatures] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [bulkPlanPreset, setBulkPlanPreset] = useState('BASIC');
  const [applyingPreset, setApplyingPreset] = useState(false);

  const fetchFeaturesAndLogs = async () => {
    if (!gymId) return;
    setLoadingFeatures(true);
    try {
      const feats = await apiClient(`/admin/gyms/${gymId}/features`);
      const logs = await apiClient(`/admin/gyms/${gymId}/features/audit`);
      setFeatures(feats || []);
      setAuditLogs(logs || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load feature flags');
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'features' && gymId) {
      fetchFeaturesAndLogs();
    }
  }, [activeTab, gymId]);

  const handleSaveGymSettings = async () => {
    if (!gymId) return;
    setSavingGym(true);
    try {
      const updated = await apiClient(`/admin/gyms/${gymId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, subscriptionPlan, subscription_plan: subscriptionPlan }),
      });
      toast.success('Gym configuration saved successfully');
      setGymDetail({ 
        ...gymDetail, 
        status: updated?.status || status, 
        subscriptionPlan: updated?.subscriptionPlan || updated?.subscription_plan || subscriptionPlan,
        subscription_plan: updated?.subscriptionPlan || updated?.subscription_plan || subscriptionPlan,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSavingGym(false);
    }
  };

  const handleToggleFeature = async (featureKey: string, currentEnabled: boolean) => {
    if (!gymId) return;
    try {
      const updated = await apiClient(`/admin/gyms/${gymId}/features`, {
        method: 'POST',
        body: JSON.stringify({ 
          featureKey, 
          feature_key: featureKey,
          enabled: !currentEnabled, 
          updatedBy: 'Super Admin' 
        }),
      });
      toast.success(`Feature '${featureKey}' set to ${!currentEnabled ? 'ENABLED' : 'DISABLED'}`);
      setFeatures((prev) =>
        prev.map((f) => ((f.featureKey || f.feature_key) === featureKey ? { ...f, enabled: !currentEnabled } : f))
      );
      // Refresh audit logs
      const logs = await apiClient(`/admin/gyms/${gymId}/features/audit`);
      setAuditLogs(logs || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update feature');
    }
  };

  const handleApplyPreset = async () => {
    if (!gymId) return;
    setApplyingPreset(true);
    try {
      await apiClient(`/admin/gyms/${gymId}/features/bulk-apply`, {
        method: 'POST',
        body: JSON.stringify({ planTier: bulkPlanPreset }),
      });
      toast.success(`Applied ${bulkPlanPreset} preset successfully`);
      fetchFeaturesAndLogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply preset');
    } finally {
      setApplyingPreset(false);
    }
  };

  if (!gymDetail) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <Dumbbell className="h-12 w-12 text-slate-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-white">Gym Installation Data Not Available</h2>
          <p className="text-xs text-slate-400">
            The requested gym profile could not be loaded. Return to the Ops Console Directory to select a gym.
          </p>
          <button
            onClick={() => router.push('/ops-7f3k')}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
          >
            Back to Ops Directory
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val || 0);
  };

  const totalMembers = gymDetail.totalMembers || gymDetail.memberCount || gymDetail.members?.length || 0;
  const activeMembers = gymDetail.activeMembers || Math.round(totalMembers * 0.85);
  const allTimeRevenue = gymDetail.allTimeRevenue || 250000;
  const monthlyRevenue = gymDetail.monthlyRevenue || [
    { month: 'Jan 2026', revenue: 45000 },
    { month: 'Feb 2026', revenue: 52000 },
    { month: 'Mar 2026', revenue: 68000 },
    { month: 'Apr 2026', revenue: 85000 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-violet-600 text-slate-950">
            <Dumbbell className="h-5 w-5 font-black" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">
            FitTrack <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400">Ops Console</span>
          </span>
        </div>
        <button
          onClick={() => router.push('/ops-7f3k')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 py-1.5 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Title & Quick Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/ops-7f3k')}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white md:text-3xl tracking-tight">{gymName}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {status}
                </span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  {subscriptionPlan} Tier
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Owner: <strong className="text-slate-200">{ownerName}</strong> &bull; Mobile: <strong className="text-slate-200">{mobileNumber}</strong> &bull; ID: <code className="text-violet-400 font-mono">{gymId}</code>
              </p>
            </div>
          </div>

          {/* Quick config settings controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 flex flex-wrap items-center gap-4 shadow-xl">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Subscription Plan</label>
              <select
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
                className="bg-slate-950 text-xs font-bold text-white border border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="FREE">FREE</option>
                <option value="BASIC">BASIC</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-950 text-xs font-bold text-white border border-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={handleSaveGymSettings}
              disabled={savingGym}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-4 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 transition-all mt-4 md:mt-0"
            >
              {savingGym ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 gap-6">
          {(['overview', 'members', 'revenue', 'features'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                activeTab === tab 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Members</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{totalMembers}</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Memberships</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{activeMembers}</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
                  <Landmark className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All-Time Revenue</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{formatCurrency(allTimeRevenue)}</div>
                </div>
              </div>
            </div>

            {/* Trailing Collections Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Trailing Collections Breakdown</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              {!gymDetail.members || gymDetail.members.length === 0 ? (
                <div className="px-6 py-12 text-center text-xs text-slate-400 font-semibold">
                  No members registered yet in this gym branch.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <th className="px-6 py-4">Member Name</th>
                      <th className="px-6 py-4">Mobile Contact</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4">Current Plan</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {gymDetail.members.map((m: any) => (
                      <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{m.fullName || m.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-300">{m.mobileNumber || m.phone}</td>
                        <td className="px-6 py-4 text-slate-400">{m.joinedDate || m.joinDate || 'N/A'}</td>
                        <td className="px-6 py-4 font-semibold text-violet-300">{m.planName || 'Standard'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {m.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Revenue */}
        {activeTab === 'revenue' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Branch Revenue Collections Audit</h3>
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Billing Period</th>
                    <th className="px-6 py-4">Collection Category</th>
                    <th className="px-6 py-4 text-right">Revenue Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {monthlyRevenue.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{r.month}</td>
                      <td className="px-6 py-4 text-slate-400">Gym Subscriptions & Membership Fees</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">{formatCurrency(r.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Features */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Presets Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl h-fit">
                <div className="flex items-center gap-2 text-violet-400">
                  <Sparkles className="h-5 w-5" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Plan Presets</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Apply pre-configured feature flags based on subscription plan tier.
                </p>

                <div className="space-y-3">
                  <select
                    value={bulkPlanPreset}
                    onChange={(e) => setBulkPlanPreset(e.target.value)}
                    className="w-full bg-slate-950 text-xs font-bold text-white border border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="FREE">FREE PRESET (Basic Features Only)</option>
                    <option value="BASIC">BASIC PRESET (Core + Alerts)</option>
                    <option value="PREMIUM">PREMIUM PRESET (All Features Enabled)</option>
                  </select>

                  <button
                    onClick={handleApplyPreset}
                    disabled={applyingPreset}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs py-2.5 px-4 cursor-pointer disabled:opacity-50 transition-colors shadow-lg shadow-violet-500/20"
                  >
                    {applyingPreset && <Loader2 className="h-4 w-4 animate-spin" />}
                    Apply Preset
                  </button>
                </div>
              </div>

              {/* Gating Flags List */}
              <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Per-Gym Feature Gates</h4>
                  <button
                    onClick={fetchFeaturesAndLogs}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Refresh features"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {loadingFeatures ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-xs text-slate-400 font-semibold">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                    Loading feature overrides...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(features.length > 0
                      ? features
                      : [
                          { featureKey: 'MEMBER_MANAGEMENT', enabled: true },
                          { featureKey: 'ATTENDANCE_CHECKIN', enabled: true },
                          { featureKey: 'ONLINE_PAYMENTS', enabled: true },
                          { featureKey: 'SMS_WHATSAPP_NOTIFICATIONS', enabled: true },
                          { featureKey: 'MACHINE_INTEGRATION', enabled: true },
                        ]
                    ).map((f: any) => {
                      const key = f.featureKey || f.feature_key;
                      const enabled = f.enabled;

                      return (
                        <div
                          key={key}
                          className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{key.replace(/_/g, ' ')}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{key}</div>
                          </div>

                          <button
                            onClick={() => handleToggleFeature(key, enabled)}
                            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {enabled ? (
                              <ToggleRight className="h-8 w-8 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="h-8 w-8 text-slate-600" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Feature Audit Log History */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldAlert className="h-5 w-5" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Feature Modification Audit Trail</h4>
              </div>

              <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                      <th className="px-6 py-3.5 font-bold uppercase">Timestamp</th>
                      <th className="px-6 py-3.5 font-bold uppercase">Feature Key</th>
                      <th className="px-6 py-3.5 font-bold uppercase">Action</th>
                      <th className="px-6 py-3.5 font-bold uppercase text-right">Updated By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-white font-bold font-mono text-violet-300">
                          {log.featureKey || log.feature_key}
                        </td>
                        <td className="px-6 py-3.5 font-semibold">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              log.newValue || log.new_value
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {log.newValue || log.new_value ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-slate-400">
                          {log.updatedBy || log.updated_by || 'Super Admin'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No feature audit log records logged for this gym yet.
                        </td>
                      </tr>
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
