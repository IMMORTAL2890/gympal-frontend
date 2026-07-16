'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Phone, ArrowUpDown, ChevronRight, User } from 'lucide-react';

interface MembersListClientProps {
  initialMembers: any[];
  initialQuery: string;
  initialStatus: string;
  initialSortByDues: boolean;
}

export default function MembersListClient({
  initialMembers,
  initialQuery,
  initialStatus,
  initialSortByDues,
}: MembersListClientProps) {
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [sortByDues, setSortByDues] = useState(initialSortByDues);

  // Trigger search params routing updates on filter changes
  const applyFilters = (q: string, s: string, dues: boolean) => {
    const duesParam = dues ? '&dues=1' : '';
    router.push(`/members?query=${encodeURIComponent(q)}&status=${s}${duesParam}`);
  };

  const handleStatusClick = (status: string) => {
    setStatusFilter(status);
    const dues = status === 'dues' ? true : sortByDues;
    if (status === 'dues') setSortByDues(true);
    applyFilters(query, status, dues);
  };

  const handleDuesToggle = () => {
    const nextDuesVal = !sortByDues;
    setSortByDues(nextDuesVal);
    applyFilters(query, statusFilter, nextDuesVal);
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Members Directory</h1>
          <p className="text-xs text-muted-foreground">Manage gym members, access permissions, and billing ledger.</p>
        </div>
        <button
          onClick={() => router.push('/members/new')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Add Member
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); applyFilters(query, statusFilter, sortByDues); }}
            className="relative w-full md:max-w-md"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type search & press Enter..."
              className="w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
            />
          </form>

          {/* Dues Sorting Toggle */}
          <button
            onClick={handleDuesToggle}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
              sortByDues ? 'bg-warning/15 border-warning text-warning' : 'bg-white hover:bg-muted/40 text-muted-foreground'
            }`}
          >
            <ArrowUpDown className="h-4 w-4" />
            Dues First
          </button>
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'active', 'expiring', 'expired', 'dues'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusClick(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border tracking-wider transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white hover:bg-muted/40 border-border text-muted-foreground'
                }`}
              >
                {status === 'dues' ? 'Outstanding Dues' : status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Listings */}
      {!initialMembers || initialMembers.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <User className="h-6 w-6" />
          </div>
          <h3 className="text-md font-bold text-foreground">No members found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Try adjusting your search query, status filters, or add a new member.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Member Details</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Plan</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Outstanding Dues</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Access Badge</th>
                </tr>
              </thead>
              <tbody>
                {initialMembers.map((m: any) => (
                  <tr
                    key={m.member.id}
                    onClick={() => router.push(`/members/${m.member.id}`)}
                    className="border-b hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm select-none">
                          {m.member.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{m.member.fullName}</div>
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {m.member.mobileNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">
                      {m.latestMembership ? m.latestMembership.plan.planName : 'No Plan'}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      {m.latestMembership ? (
                        <div className="flex flex-col">
                          <span>{m.latestMembership.endDate}</span>
                          <span className={`text-[10px] font-bold mt-0.5 ${
                            m.status === 'expiring' 
                              ? 'text-warning' 
                              : m.status === 'expired' 
                              ? 'text-destructive' 
                              : m.status === 'inactive'
                              ? 'text-muted-foreground'
                              : 'text-success'
                          }`}>
                            {m.status.toUpperCase()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-destructive font-bold uppercase">Expired</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {m.totalDues > 0 ? (
                        <span className="text-destructive">{formatCurrency(m.totalDues)}</span>
                      ) : (
                        <span className="text-success">Paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          m.member.accessStatus === 'allowed'
                            ? 'bg-success/15 text-success'
                            : 'bg-destructive/15 text-destructive'
                        }`}>
                          {m.member.accessStatus}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
