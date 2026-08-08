'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, Search, Filter, History, Calendar, CheckCircle, XCircle, RefreshCw, ChevronRight, Sliders } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface AuditLogExplorerClientProps {
  initialLogs?: any[];
}

export default function AuditLogExplorerClient({ initialLogs = [] }: AuditLogExplorerClientProps) {
  const [logs, setLogs] = useState<any[]>(initialLogs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient('/admin/audit-logs');
      setLogs(res || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialLogs.length === 0) {
      fetchLogs();
    }
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      (log.gym_name && log.gym_name.toLowerCase().includes(search.toLowerCase())) ||
      (log.feature_key && log.feature_key.toLowerCase().includes(search.toLowerCase())) ||
      (log.updated_by && log.updated_by.toLowerCase().includes(search.toLowerCase()));

    const matchesFeature = selectedFeature === 'ALL' || log.feature_key === selectedFeature;

    return matchesSearch && matchesFeature;
  });

  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error('No audit logs available to export');
      return;
    }

    const headers = ['Timestamp', 'Gym Name', 'Feature Key', 'Old Value', 'New Value', 'Admin / Updated By'];
    const rows = filteredLogs.map((l) => [
      new Date(l.timestamp).toLocaleString(),
      `"${l.gym_name || l.gym_id}"`,
      l.feature_key,
      l.old_value !== undefined ? (l.old_value ? 'ENABLED' : 'DISABLED') : 'N/A',
      l.new_value ? 'ENABLED' : 'DISABLED',
      `"${l.updated_by || 'Super Admin'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fittrack_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs exported to CSV successfully');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 border border-violet-500/30 text-violet-400">
            <History className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Audit Log Explorer
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Global timeline of administrative action audit trail across all gym installations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50 cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit logs by gym, feature, or admin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Feature:</span>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Features</option>
              <option value="MEMBER_MANAGEMENT" className="bg-slate-900 text-white">MEMBER_MANAGEMENT</option>
              <option value="ATTENDANCE_CHECKIN" className="bg-slate-900 text-white">ATTENDANCE_CHECKIN</option>
              <option value="ONLINE_PAYMENTS" className="bg-slate-900 text-white">ONLINE_PAYMENTS</option>
              <option value="SMS_WHATSAPP_NOTIFICATIONS" className="bg-slate-900 text-white">SMS_WHATSAPP_NOTIFICATIONS</option>
              <option value="MACHINE_INTEGRATION" className="bg-slate-900 text-white">MACHINE_INTEGRATION</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Timeline Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Gym Installation</th>
                <th className="px-6 py-4">Feature Key</th>
                <th className="px-6 py-4 text-center">Previous State</th>
                <th className="px-6 py-4 text-center">New State</th>
                <th className="px-6 py-4 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    No audit log records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isNewEnabled = log.new_value;
                  const isOldEnabled = log.old_value;

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {log.gym_name || `Gym ${log.gym_id.slice(0, 8)}...`}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-violet-300">
                        <span className="bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                          {log.feature_key}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isOldEnabled === undefined ? (
                          <span className="text-slate-500">N/A</span>
                        ) : isOldEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <CheckCircle className="h-3 w-3" /> ENABLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                            <XCircle className="h-3 w-3" /> DISABLED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isNewEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            <CheckCircle className="h-3 w-3" /> ENABLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-md">
                            <XCircle className="h-3 w-3" /> DISABLED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-300">
                        {log.updated_by || 'Super Admin'}
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
  );
}
