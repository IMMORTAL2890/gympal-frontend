'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, LogOut, Search, Filter, Loader2, ArrowLeft } from 'lucide-react';
import { clearTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface OpsUsersClientProps {
  initialUsers: any[];
  gyms: any[];
}

export default function OpsUsersClient({ initialUsers, gyms }: OpsUsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGym, setSelectedGym] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGym) params.append('gymId', selectedGym);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPlan) params.append('plan', selectedPlan);

      const data = await apiClient(`/admin/users?${params.toString()}`);
      setUsers(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedGym, selectedStatus, selectedPlan]);

  const handleLogout = () => {
    clearTokens();
    toast.success('Admin logged out');
    router.push('/ops-7f3k/login');
  };

  // Client-side search filter
  const filteredUsers = users.filter((u: any) => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery)
  );

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
            <button onClick={() => router.push('/ops-7f3k/users')} className="text-white hover:text-white cursor-pointer">Users</button>
            <button onClick={() => router.push('/ops-7f3k/revenue')} className="hover:text-white cursor-pointer">Revenue</button>
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
        <div className="flex items-start gap-4">
          <button
            onClick={() => router.push('/ops-7f3k')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">Platform Members Registry</h1>
            <p className="text-xs text-slate-400 mt-1">Cross-branch audit list of all registered member subscriptions and billing dates.</p>
          </div>
        </div>

        {/* Filter controls panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-450" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Gym Filter */}
            <div className="relative">
              <select
                value={selectedGym}
                onChange={(e) => setSelectedGym(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white outline-none focus:border-indigo-400 transition-colors appearance-none"
              >
                <option value="">All Branches</option>
                {gyms?.map((g) => (
                  <option key={g.gymId} value={g.gymId}>{g.gymName}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white outline-none focus:border-indigo-400 transition-colors appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Plan Filter */}
            <div className="relative">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs text-white outline-none focus:border-indigo-400 transition-colors appearance-none"
              >
                <option value="">All Plans</option>
                <option value="FREE">FREE</option>
                <option value="BASIC">BASIC</option>
                <option value="PREMIUM">PREMIUM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-2 text-xs text-slate-400 font-semibold">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              Loading member data...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Member Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Payment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u: any) => (
                    <tr key={u.memberId} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-350">{u.gymName}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">{u.email || '-'}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-300">{u.phone}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{u.joinDate}</td>
                      <td className="px-6 py-4 text-xs text-slate-450 font-bold">{u.lastPaymentDate || 'Never'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          u.membershipStatus === 'active' || u.membershipStatus === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : u.membershipStatus === 'expiring_soon' || u.membershipStatus === 'EXPIRING_SOON'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-450 border border-rose-500/30'
                        }`}>
                          {u.membershipStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-400 font-semibold">
                        No members found matching the selected search and filter constraints.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
