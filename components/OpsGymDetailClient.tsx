'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, ArrowLeft, Users, UserCheck, Landmark, BarChart3, ShieldAlert, ToggleLeft, ToggleRight, Loader2, Save, Sparkles, RefreshCcw } from 'lucide-react';
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
  
  // Gym level states
  const [status, setStatus] = useState(initialDetail?.status || 'active');
  const [subscriptionPlan, setSubscriptionPlan] = useState(initialDetail?.subscriptionPlan || 'BASIC');
  const [savingGym, setSavingGym] = useState(false);

  // Features list state
  const [features, setFeatures] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [bulkPlanPreset, setBulkPlanPreset] = useState('BASIC');
  const [applyingPreset, setApplyingPreset] = useState(false);

  const fetchFeaturesAndLogs = async () => {
    setLoadingFeatures(true);
    try {
      const feats = await apiClient(`/admin/gyms/${gymDetail.gymId}/features`);
      const logs = await apiClient(`/admin/gyms/${gymDetail.gymId}/features/audit`);
      setFeatures(feats || []);
      setAuditLogs(logs || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load feature flags');
    } finally {
      setLoadingFeatures(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'features' && gymDetail?.gymId) {
      fetchFeaturesAndLogs();
    }
  }, [activeTab, gymDetail?.gymId]);

  const handleSaveGymSettings = async () => {
    setSavingGym(true);
    try {
      const updated = await apiClient(`/admin/gyms/${gymDetail.gymId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, subscriptionPlan }),
      });
      toast.success('Gym configuration saved');
      setGymDetail({ ...gymDetail, status: updated.status, subscriptionPlan: updated.subscriptionPlan });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSavingGym(false);
    }
  };

  const handleToggleFeature = async (featureKey: string, currentEnabled: boolean) => {
    try {
      const updated = await apiClient(`/admin/gyms/${gymDetail.gymId}/features`, {
        method: 'POST',
        body: JSON.stringify({ featureKey, enabled: !currentEnabled }),
      });
      toast.success(`Feature '${featureKey}' updated`);
      setFeatures(features.map(f => f.featureKey === featureKey ? updated : f));
      // Refresh audit logs
      const logs = await apiClient(`/admin/gyms/${gymDetail.gymId}/features/audit`);
      setAuditLogs(logs || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update feature');
    }
  };

  const handleApplyPreset = async () => {
    setApplyingPreset(true);
    try {
      await apiClient(`/admin/gyms/${gymDetail.gymId}/features/bulk-apply`, {
        method: 'POST',
        body: JSON.stringify({ planTier: bulkPlanPreset }),
      });
      toast.success(`Applied ${bulkPlanPreset} preset`);
      fetchFeaturesAndLogs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply preset');
    } finally {
      setApplyingPreset(false);
    }
  };

  if (!gymDetail) return null;

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-indigo-400" />
          <span className="font-extrabold text-white text-lg tracking-wide">FitTrack <span className="text-indigo-400">Ops Console</span></span>
        </div>
        <button
          onClick={() => router.push('/ops-7f3k')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-slate-700 py-1.5 px-4 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Detail Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/ops-7f3k')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white md:text-3xl">{gymDetail.gymName}</h1>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  gymDetail.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {gymDetail.status}
                </span>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {gymDetail.subscriptionPlan} Tier
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Owner: {gymDetail.ownerName} &bull; Contact: {gymDetail.mobileNumber}</p>
            </div>
          </div>

          {/* Quick config settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Plan Tier</label>
              <select
                value={subscriptionPlan}
                onChange={(e) => setSubscriptionPlan(e.target.value)}
                className="bg-slate-800 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              >
                <option value="FREE">FREE</option>
                <option value="BASIC">BASIC</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-slate-800 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-400"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <button
              onClick={handleSaveGymSettings}
              disabled={savingGym}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2 px-4 shadow-sm cursor-pointer disabled:opacity-50 mt-4 md:mt-0"
            >
              {savingGym ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Config
            </button>
          </div>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex border-b border-slate-800 gap-6">
          {(['overview', 'members', 'revenue', 'features'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-extrabold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                activeTab === tab 
                  ? 'border-indigo-400 text-indigo-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Components */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400"><Users className="h-6 w-6" /></div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Members</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{gymDetail.totalMembers}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><UserCheck className="h-6 w-6" /></div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Members</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{gymDetail.activeMembers}</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400"><Landmark className="h-6 w-6" /></div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All-Time Collection</div>
                  <div className="text-2xl font-bold text-white mt-0.5">{formatCurrency(gymDetail.allTimeRevenue)}</div>
                </div>
              </div>
            </div>

            {/* Trailing 12-Month Revenue Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trailing 12-Month Collections</h3>
              </div>
              <div className="h-64">
                {gymDetail.monthlyRevenue?.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No collections logged.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gymDetail.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              {!gymDetail.members || gymDetail.members.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-slate-400 font-semibold">
                  No members registered yet in this branch.
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-800/40 border-b border-slate-800">
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Member Name</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</th>
                      <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {gymDetail.members.map((m: any) => (
                      <tr key={m.id} className="hover:bg-slate-800/25 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{m.fullName}</td>
                        <td className="px-6 py-4 font-semibold text-slate-300">{m.mobileNumber}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-400">{m.joinedDate}</td>
                        <td className="px-6 py-4 font-semibold text-slate-400">{m.planName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            m.status === 'active' || m.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : m.status === 'expiring_soon' || m.status === 'EXPIRING_SOON'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {m.status}
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

        {activeTab === 'revenue' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Branch Collections Audit</h3>
            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Date</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Collection Category</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Collection Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {gymDetail.monthlyRevenue?.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="px-6 py-4 text-xs font-bold text-slate-300">{r.month}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">Regular Membership Billing</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">{formatCurrency(r.revenue)}</td>
                    </tr>
                  ))}
                  {(!gymDetail.monthlyRevenue || gymDetail.monthlyRevenue.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-xs text-slate-400 font-semibold">No revenue details mapped.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Presets and Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Presets Apply */}
              <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm h-fit">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Subscription presets</h4>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Bulk-apply feature flags preset based on the subscription tier selection for this tenant gym.
                </p>

                <div className="space-y-2">
                  <select
                    value={bulkPlanPreset}
                    onChange={(e) => setBulkPlanPreset(e.target.value)}
                    className="w-full bg-slate-850 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-400"
                  >
                    <option value="FREE">FREE PRESET (Basic Features Only)</option>
                    <option value="BASIC">BASIC PRESET (Core + Communication)</option>
                    <option value="PREMIUM">PREMIUM PRESET (All Features Enabled)</option>
                  </select>

                  <button
                    onClick={handleApplyPreset}
                    disabled={applyingPreset}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs py-2.5 px-4 cursor-pointer disabled:opacity-50"
                  >
                    {applyingPreset && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Apply Preset
                  </button>
                </div>
              </div>

              {/* Gating Flags List */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Individual Feature Gates</h4>
                  <button onClick={fetchFeaturesAndLogs} className="p-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white cursor-pointer" aria-label="Refresh">
                    <RefreshCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {loadingFeatures ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-xs text-slate-400 font-semibold">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                    Syncing feature logs...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {features.map((f: any) => (
                      <div
                        key={f.featureKey}
                        className="bg-slate-850 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{f.featureKey.replace(/_/g, ' ')}</div>
                          <div className="text-[9px] text-slate-400 mt-1">
                            Last changed: {f.updatedAt ? new Date(f.updatedAt).toLocaleDateString() : 'Never'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleFeature(f.featureKey, f.enabled)}
                          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                          aria-label={`Toggle ${f.featureKey}`}
                        >
                          {f.enabled ? (
                            <ToggleRight className="h-7 w-7 text-indigo-400" />
                          ) : (
                            <ToggleLeft className="h-7 w-7 text-slate-600" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-4.5 w-4.5 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Feature Modification Audit Trail</h4>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/40 border-b border-slate-800 text-slate-400">
                      <th className="px-6 py-3 font-bold uppercase">Timestamp</th>
                      <th className="px-6 py-3 font-bold uppercase">Feature Key</th>
                      <th className="px-6 py-3 font-bold uppercase">Action</th>
                      <th className="px-6 py-3 font-bold uppercase">Authorized Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="px-6 py-3 text-slate-300 font-semibold">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3 text-white font-bold">{log.featureKey.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-3 font-semibold">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            log.newValue ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'
                          }`}>
                            {log.newValue ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-400 font-medium">System Administrator</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-6 text-center text-slate-400 font-semibold">No audit logs logged yet.</td>
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
