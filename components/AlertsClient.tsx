'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, MessageSquare, AlertTriangle, Send, CalendarDays, Loader2 } from 'lucide-react';
import { buildWaLink } from '@/lib/utils/wa';
import { logNotificationAction } from '@/app/actions';
import { toast } from 'sonner';

interface AlertsClientProps {
  initialAlerts: any;
}

export default function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const expiringList = initialAlerts?.expiring || [];
  const duesList = initialAlerts?.dues || [];

  const handleSendReminder = async (alert: any, type: 'expiry' | 'due') => {
    let msg = '';
    if (type === 'expiry') {
      msg = `Hi ${alert.memberName}, your ${alert.planName} expires on ${alert.endDate}. Please renew soon to continue workouts.`;
    } else {
      msg = `Hi ${alert.memberName}, you have an outstanding due of ₹${alert.dueAmount} for your gym membership. Please pay soon.`;
    }

    try {
      await logNotificationAction({
        membershipId: alert.membershipId,
        message: msg,
        status: 'sent',
      });
    } catch (e) {
      // ignore log errors
    }

    const link = buildWaLink(alert.mobileNumber, msg);
    window.open(link, '_blank');
    router.refresh();
  };

  const handleSendAll = async () => {
    const totalCount = expiringList.length + duesList.length;
    if (totalCount === 0) return;

    setLoading(true);
    toast.info('Sending all reminders. Please ensure your browser allows popup windows!');

    // Expiring
    for (const alert of expiringList) {
      const msg = `Hi ${alert.memberName}, your ${alert.planName} expires on ${alert.endDate}. Please renew soon to continue workouts.`;
      try {
        await logNotificationAction({ membershipId: alert.membershipId, message: msg, status: 'sent' });
      } catch(e) {}
      window.open(buildWaLink(alert.mobileNumber, msg), '_blank');
    }

    // Dues
    for (const alert of duesList) {
      const msg = `Hi ${alert.memberName}, you have an outstanding due of ₹${alert.dueAmount} for your gym membership. Please pay soon.`;
      try {
        await logNotificationAction({ membershipId: alert.membershipId, message: msg, status: 'sent' });
      } catch(e) {}
      window.open(buildWaLink(alert.mobileNumber, msg), '_blank');
    }

    toast.success(`Completed! Opened ${totalCount} WhatsApp tabs.`);
    setLoading(false);
    router.refresh();
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">System Alerts</h1>
          <p className="text-xs text-muted-foreground">Review upcoming member plan expirations and outstanding membership dues.</p>
        </div>
        
        {(expiringList.length > 0 || duesList.length > 0) && (
          <button
            onClick={handleSendAll}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-success text-success-foreground py-2.5 px-5 text-sm font-bold hover:bg-success/90 shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
            Send All Reminders
          </button>
        )}
      </div>

      {expiringList.length === 0 && duesList.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <BellRing className="h-6 w-6" />
          </div>
          <h3 className="text-md font-bold text-foreground">No alerts active</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All member memberships are active and all dues have been cleared. Excellent job!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expiring Memberships */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-fit">
            <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/20">
              <CalendarDays className="h-4.5 w-4.5 text-warning" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Expiring In 7 Days ({expiringList.length})</h3>
            </div>
            
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {expiringList.length === 0 ? (
                <div className="p-6 text-center text-xs font-semibold text-muted-foreground">
                  No plans expiring in the next 7 days.
                </div>
              ) : (
                expiringList.map((item: any) => (
                  <div key={item.membershipId} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-foreground">{item.memberName}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">
                        {item.planName} &bull; Expires: {item.endDate}
                      </p>
                      <span className="inline-flex px-2 py-0.5 rounded bg-warning/10 text-warning text-[9px] font-bold uppercase mt-1">
                        {item.daysRemaining} days left
                      </span>
                    </div>

                    <button
                      onClick={() => handleSendReminder(item, 'expiry')}
                      className="p-2 rounded-xl border bg-white hover:bg-success/15 hover:border-success/35 text-success transition-all shadow-sm cursor-pointer"
                      title="Send WA Expiry Reminder"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Outstanding Dues */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between h-fit">
            <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/20">
              <AlertTriangle className="h-4.5 w-4.5 text-destructive" />
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Outstanding Dues ({duesList.length})</h3>
            </div>

            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {duesList.length === 0 ? (
                <div className="p-6 text-center text-xs font-semibold text-muted-foreground">
                  No outstanding dues recorded.
                </div>
              ) : (
                duesList.map((item: any) => (
                  <div key={item.membershipId} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-foreground">{item.memberName}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5">
                        {item.planName} &bull; Expiry: {item.endDate}
                      </p>
                      <span className="inline-flex px-2 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-bold mt-1">
                        Due: {formatCurrency(item.dueAmount)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSendReminder(item, 'due')}
                      className="p-2 rounded-xl border bg-white hover:bg-success/15 hover:border-success/35 text-success transition-all shadow-sm cursor-pointer"
                      title="Send WA Due Reminder"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
