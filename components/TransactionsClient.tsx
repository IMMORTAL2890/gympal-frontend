'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Calendar, CreditCard, Search, Receipt } from 'lucide-react';

interface TransactionsClientProps {
  initialTransactions: any[];
  from: string;
  to: string;
  mode: string;
}

export default function TransactionsClient({
  initialTransactions,
  from,
  to,
  mode,
}: TransactionsClientProps) {
  const router = useRouter();

  const [fromStr, setFromStr] = useState(from);
  const [toStr, setToStr] = useState(to);
  const [modeFilter, setModeFilter] = useState(mode);
  const [searchMember, setSearchMember] = useState('');

  const applyFilters = (f: string, t: string, m: string) => {
    const modeParam = m ? `&mode=${m}` : '';
    router.push(`/transactions?from=${f}&to=${t}${modeParam}`);
  };

  // Client-side filtering for member search
  const filteredTxs = initialTransactions?.filter((t: any) =>
    t.memberName.toLowerCase().includes(searchMember.toLowerCase())
  ) || [];

  const totalAmount = filteredTxs.reduce((sum: number, t: any) => sum + t.amount, 0);

  const exportToCsv = () => {
    if (filteredTxs.length === 0) return;
    const headers = 'Payment Date,Member Name,Plan Name,Amount,Payment Mode,Note\n';
    const rows = filteredTxs.map((t: any) => 
      `"${t.paymentDate}","${t.memberName}","${t.planName}",${t.amount},"${t.paymentMode.toUpperCase()}","${t.note || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fittrack_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Payment Ledger</h1>
          <p className="text-xs text-muted-foreground">Chronological logs of all member payment transactions and receipts.</p>
        </div>
        <button
          onClick={exportToCsv}
          disabled={filteredTxs.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white text-foreground py-2.5 px-4 text-xs font-bold hover:bg-muted/40 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Download className="h-4.5 w-4.5" />
          Export CSV
        </button>
      </div>

      {/* Filters card */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ledger Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Start Date</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="date"
                value={fromStr}
                onChange={(e) => {
                  setFromStr(e.target.value);
                  applyFilters(e.target.value, toStr, modeFilter);
                }}
                className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">End Date</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="date"
                value={toStr}
                onChange={(e) => {
                  setToStr(e.target.value);
                  applyFilters(fromStr, e.target.value, modeFilter);
                }}
                className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Payment Mode</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
              <select
                value={modeFilter}
                onChange={(e) => {
                  setModeFilter(e.target.value);
                  applyFilters(fromStr, toStr, e.target.value);
                }}
                className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-xs outline-none focus:border-primary"
              >
                <option value="">All Modes</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Search Member</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search visible..."
                className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted/40 p-4 rounded-xl border border-border/40 mt-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase">Ledger Subtotal (Filtered):</span>
          </div>
          <span className="text-xl font-extrabold text-foreground">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <Receipt className="h-6 w-6" />
          </div>
          <h3 className="text-md font-bold text-foreground">No transactions recorded</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No payments match the selected date range or filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Member Name</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Name</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Paid</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((t: any) => (
                  <tr key={t.id} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{t.paymentDate}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{t.memberName}</td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">{t.planName}</td>
                    <td className="px-6 py-4 font-bold text-success">{formatCurrency(t.amount)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-muted text-muted-foreground border">
                        {t.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{t.note || '-'}</td>
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
