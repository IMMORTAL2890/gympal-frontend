'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Phone, Mail, Calendar, MapPin, Key, ShieldCheck, 
  ShieldAlert, Edit3, Plus, MessageSquare, 
  CheckCircle, X, Loader2, Landmark, CreditCard, DollarSign, ArrowUpRight, AlertCircle
} from 'lucide-react';
import { buildWaLink } from '@/lib/utils/wa';
import { 
  editMemberAction, 
  overrideMemberAccessAction, 
  assignMembershipAction, 
  addSubsequentPaymentAction,
  logNotificationAction 
} from '@/app/actions';
import { toast } from 'sonner';

interface MemberDetailClientProps {
  memberId: string;
  detail: any;
  plans: any[];
}

export default function MemberDetailClient({ memberId, detail, plans }: MemberDetailClientProps) {
  const router = useRouter();

  // Dialog toggles
  const [editOpen, setEditOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // 1. Edit Member Profile states
  const [editName, setEditName] = useState(detail?.member?.fullName || '');
  const [editMobile, setEditMobile] = useState(detail?.member?.mobileNumber || '');
  const [editEmail, setEditEmail] = useState(detail?.member?.email || '');
  const [editDob, setEditDob] = useState(detail?.member?.dateOfBirth || '');
  const [editAddress, setEditAddress] = useState(detail?.member?.address || '');
  const [editBiometric, setEditBiometric] = useState(detail?.member?.biometricUid || '');

  const openEditModal = () => {
    if (detail?.member) {
      setEditName(detail.member.fullName);
      setEditMobile(detail.member.mobileNumber);
      setEditEmail(detail.member.email || '');
      setEditDob(detail.member.dateOfBirth || '');
      setEditAddress(detail.member.address || '');
      setEditBiometric(detail.member.biometricUid || '');
      setEditOpen(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await editMemberAction(memberId, {
        fullName: editName,
        mobileNumber: editMobile,
        email: editEmail || null,
        dateOfBirth: editDob || null,
        address: editAddress || null,
        biometricUid: editBiometric || null,
      });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Profile updated successfully!');
      setEditOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Access Manual Overrides states
  const [accessAction, setAccessAction] = useState('block');
  const [accessReason, setAccessReason] = useState('');

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await overrideMemberAccessAction(memberId, {
        action: accessAction,
        reason: accessReason || (accessAction === 'block' ? 'Manual block' : 'Manual unblock'),
      });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Access configuration updated!');
      setAccessOpen(false);
      setAccessReason('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // 3. Renew Membership states
  const [renewPlanId, setRenewPlanId] = useState('');
  const [renewStart, setRenewStart] = useState(new Date().toISOString().split('T')[0]);
  const [renewEnd, setRenewEnd] = useState('');
  const [renewFee, setRenewFee] = useState('');
  const [renewDiscount, setRenewDiscount] = useState('0');
  const [renewDiscountNote, setRenewDiscountNote] = useState('');
  const [renewPayment, setRenewPayment] = useState('');
  const [renewMode, setRenewMode] = useState('cash');
  const [renewNotes, setRenewNotes] = useState('');

  const handlePlanSelect = (planId: string) => {
    setRenewPlanId(planId);
    const selectedPlan = plans?.find((p: any) => String(p.id) === planId);
    if (selectedPlan) {
      setRenewFee(String(selectedPlan.price));
      setRenewPayment(String(selectedPlan.price));
      
      const start = new Date(renewStart);
      start.setDate(start.getDate() + selectedPlan.durationDays);
      setRenewEnd(start.toISOString().split('T')[0]);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewPlanId) {
      toast.error('Please select a plan');
      return;
    }
    setLoading(true);
    try {
      const result = await assignMembershipAction(memberId, {
        planId: parseInt(renewPlanId, 10),
        startDate: renewStart,
        endDate: renewEnd || null,
        totalFee: Number(renewFee),
        discountAmount: Number(renewDiscount),
        discountNote: renewDiscountNote || null,
        firstPaymentAmount: Number(renewPayment),
        paymentMode: renewMode.toLowerCase(),
        notes: renewNotes || null,
      });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Plan assigned successfully!');
      setRenewOpen(false);
      setRenewPlanId('');
      setRenewDiscount('0');
      setRenewDiscountNote('');
      setRenewNotes('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Renewal failed');
    } finally {
      setLoading(false);
    }
  };

  // 4. Add Subsequent Payment states
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('cash');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNote, setPayNote] = useState('');

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;
    
    const membershipId = detail?.activeFeeSummary?.activeMembershipId;
    if (!membershipId) {
      toast.error('No active membership found to apply payment to.');
      return;
    }

    setLoading(true);
    try {
      const result = await addSubsequentPaymentAction(membershipId, {
        amount: Number(payAmount),
        mode: payMode,
        paymentDate: payDate,
        note: payNote || null,
      });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Payment added successfully!');
      setPaymentOpen(false);
      setPayAmount('');
      setPayNote('');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Payment submission failed');
    } finally {
      setLoading(false);
    }
  };

  // 5. Send WhatsApp Reminder
  const sendWhatsAppReminder = async () => {
    const { member, activeFeeSummary, memberships } = detail;
    const latestMs = memberships && memberships.length > 0 ? memberships[0] : null;

    let msg = `Hi ${member.fullName}, this is a reminder from your gym. `;
    if (activeFeeSummary && activeFeeSummary.due > 0) {
      msg += `You have an outstanding due of ₹${activeFeeSummary.due} for your membership. Please pay at your earliest convenience.`;
    } else if (latestMs) {
      msg += `Your membership plan expires on ${latestMs.endDate}. Please renew soon to continue workouts.`;
    } else {
      msg += `Please renew your membership soon to continue your gym sessions.`;
    }

    try {
      await logNotificationAction({
        membershipId: latestMs ? latestMs.id : null,
        message: msg,
        status: 'sent',
      });
    } catch (e) {
      // ignore log error
    }

    const waLink = buildWaLink(member.mobileNumber, msg);
    window.open(waLink, '_blank');
  };

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  const { member, memberships, payments, activeFeeSummary } = detail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/members')}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{member.fullName}</h1>
            <p className="text-xs text-muted-foreground">Joined: {member.joinedDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={sendWhatsAppReminder}
            className="inline-flex items-center gap-2 rounded-xl bg-success text-success-foreground py-2.5 px-4 text-xs font-bold hover:bg-success/90 shadow-sm cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            Send WA Reminder
          </button>

          <button
            onClick={openEditModal}
            className="inline-flex items-center gap-2 rounded-xl border bg-white text-foreground py-2.5 px-4 text-xs font-bold hover:bg-muted/40 cursor-pointer shadow-sm"
          >
            <Edit3 className="h-4 w-4" />
            Edit Profile
          </button>

          <button
            onClick={() => setRenewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 px-4 text-xs font-bold hover:bg-primary/90 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Assign / Renew Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Access Card */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-2xl">
                {member?.fullName?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{member?.fullName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {detail?.activeFeeSummary && (() => {
                    const latestMs = detail.memberships?.find((m: any) => m.id === detail.activeFeeSummary.activeMembershipId);
                    const today = new Date().toISOString().split('T')[0];
                    const isActive = latestMs && latestMs.startDate <= today && latestMs.endDate >= today && latestMs.paymentStatus !== 'unpaid';
                    return isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/15 px-2 py-0.5 rounded-full uppercase">
                        <CheckCircle className="h-3 w-3" /> Active Plan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/15 px-2 py-0.5 rounded-full uppercase">
                        <AlertCircle className="h-3 w-3" /> No Active Plan
                      </span>
                    );
                  })()}
                  {!detail?.activeFeeSummary && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
                      <AlertCircle className="h-3 w-3" /> No Plan
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t text-sm font-medium">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-foreground" />
                <span className="text-foreground">{member.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-foreground" />
                <span className="text-foreground">{member.email || 'No email registered'}</span>
              </div>
              {member.dateOfBirth && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-foreground" />
                  <span className="text-foreground">Born: {member.dateOfBirth}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-foreground" />
                  <span className="text-foreground">{member.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Key className="h-4 w-4 shrink-0 text-foreground" />
                <span className="text-foreground">Biometric UID: {member.biometricUid || 'Not registered'}</span>
              </div>
            </div>
          </div>

          {/* Access Control Card */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Access Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {member.accessStatus === 'allowed' ? (
                  <ShieldCheck className="h-6 w-6 text-success animate-pulse-glow rounded-full" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-destructive animate-pulse-glow rounded-full" />
                )}
                <div>
                  <div className="text-sm font-bold capitalize text-foreground">{member.accessStatus}</div>
                  {member.blockReason && (
                    <div className="text-xs text-muted-foreground font-semibold">Reason: {member.blockReason}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setAccessAction(member.accessStatus === 'allowed' ? 'block' : 'unblock');
                  setAccessOpen(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm ${
                  member.accessStatus === 'allowed' 
                    ? 'border border-destructive text-destructive hover:bg-destructive/5'
                    : 'bg-success text-success-foreground hover:bg-success/90'
                }`}
              >
                {member.accessStatus === 'allowed' ? 'Block Access' : 'Unblock Access'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Columns: Fee Summary, Transactions, Memberships */}
        <div className="lg:col-span-2 space-y-6">
          {activeFeeSummary ? (
            <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Active Plan Fee Summary</h3>
                <span className="text-xs text-muted-foreground font-semibold">
                  (Due: {formatCurrency(activeFeeSummary.due)})
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Plan Fee</div>
                  <div className="text-md font-bold text-foreground mt-1">{formatCurrency(activeFeeSummary.totalFee)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Discount</div>
                  <div className="text-md font-bold text-foreground mt-1">{formatCurrency(activeFeeSummary.discount)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Net Payable</div>
                  <div className="text-md font-bold text-foreground mt-1">{formatCurrency(activeFeeSummary.netPayable)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Paid</div>
                  <div className="text-md font-bold text-success mt-1">{formatCurrency(activeFeeSummary.paid)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-destructive uppercase">Outstanding Due</div>
                  <div className="text-md font-bold text-destructive mt-1">{formatCurrency(activeFeeSummary.due)}</div>
                </div>
              </div>

              {activeFeeSummary.due > 0 && (
                <div className="flex items-center justify-between bg-warning/10 border border-warning/20 p-3 rounded-xl">
                  <span className="text-xs text-warning font-bold">
                    {formatCurrency(activeFeeSummary.due)} will remain as outstanding due.
                  </span>
                  <button
                    onClick={() => {
                      setPayAmount(String(activeFeeSummary.due));
                      setPaymentOpen(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-warning text-white py-1 px-3 text-xs font-bold hover:bg-warning/90 shadow-sm cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Pay Due
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-8 shadow-sm text-center">
              <h3 className="text-sm font-bold text-foreground">No active membership plan</h3>
              <p className="text-xs text-muted-foreground mt-1">Assign a plan to authorize access to the gym.</p>
              <button
                onClick={() => setRenewOpen(true)}
                className="mt-4 inline-flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Assign Plan
              </button>
            </div>
          )}

          {/* Payment Transactions Ledger */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Payment Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              {!payments || payments.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-muted-foreground font-semibold">
                  No payment transactions logged.
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b">
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount Paid</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Mode</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: any) => (
                      <tr key={p.id} className="border-b">
                        <td className="px-6 py-3.5 text-xs font-medium text-muted-foreground">{p.paymentDate}</td>
                        <td className="px-6 py-3.5 font-bold text-foreground">
                          {p.membership?.plan?.planName || 'Custom'}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-success">{formatCurrency(p.amount)}</td>
                        <td className="px-6 py-3.5 text-xs font-bold uppercase text-muted-foreground">{p.paymentMode}</td>
                        <td className="px-6 py-3.5 text-xs text-muted-foreground">{p.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Membership History */}
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Membership History</h3>
            </div>
            <div className="overflow-x-auto">
              {!memberships || memberships.length === 0 ? (
                <div className="px-6 py-8 text-center text-xs text-muted-foreground font-semibold">
                  No memberships assigned yet.
                </div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b">
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Plan Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Fee</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dues</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((m: any) => {
                      const net = m.totalFee - m.discountAmount;
                      const due = net - m.amountPaid;
                      return (
                        <tr key={m.id} className="border-b">
                          <td className="px-6 py-3.5 font-bold text-foreground">{m.plan?.planName || 'Custom'}</td>
                          <td className="px-6 py-3.5 text-xs font-medium text-muted-foreground">{m.startDate}</td>
                          <td className="px-6 py-3.5 text-xs font-medium text-muted-foreground">{m.endDate}</td>
                          <td className="px-6 py-3.5 font-semibold text-muted-foreground">{formatCurrency(net)}</td>
                          <td className="px-6 py-3.5 font-bold">
                            {due > 0 ? (
                              <span className="text-destructive">{formatCurrency(due)}</span>
                            ) : (
                              <span className="text-success">Paid</span>
                            )}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              m.status === 'active' 
                                ? 'bg-success/15 text-success' 
                                : m.status === 'expiring_soon'
                                ? 'bg-warning/15 text-warning'
                                : 'bg-destructive/15 text-destructive'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border shadow-xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-md font-bold text-foreground">Edit Member Profile</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={editMobile}
                    onChange={(e) => setEditMobile(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Biometric UID</label>
                  <input
                    type="text"
                    value={editBiometric}
                    onChange={(e) => setEditBiometric(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-primary py-2 px-5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Access Manual block/unblock Modal */}
      {accessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-md font-bold text-foreground">
                {accessAction === 'block' ? 'Block Member Access' : 'Unblock Member Access'}
              </h3>
              <button onClick={() => setAccessOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleAccessSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Reason for override</label>
                <textarea
                  required
                  rows={3}
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  placeholder={accessAction === 'block' ? 'e.g. Conduct issues, non-payment, temporary leave' : 'e.g. Cleared pending fee'}
                  className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3 justify-end border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setAccessOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center gap-1.5 rounded-xl py-2 px-5 text-xs font-bold text-white cursor-pointer ${
                    accessAction === 'block' ? 'bg-destructive hover:bg-destructive/95' : 'bg-success hover:bg-success/90'
                  }`}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Assign / Renew Plan Modal */}
      {renewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-white border-l shadow-2xl p-6 animate-fade-in flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <h3 className="text-md font-bold text-foreground">Assign / Renew Plan</h3>
                <button onClick={() => setRenewOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRenewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Select Membership Plan *</label>
                  <select
                    required
                    value={renewPlanId}
                    onChange={(e) => handlePlanSelect(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2.5 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Choose a plan --</option>
                    {plans?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.planName} ({p.durationDays} Days) - {formatCurrency(p.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={renewStart}
                      onChange={(e) => setRenewStart(e.target.value)}
                      className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">End Date (Auto)</label>
                    <input
                      type="date"
                      required
                      value={renewEnd}
                      onChange={(e) => setRenewEnd(e.target.value)}
                      className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Plan Price Fee *</label>
                    <input
                      type="number"
                      required
                      value={renewFee}
                      onChange={(e) => setRenewFee(e.target.value)}
                      className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Discount Amount</label>
                    <input
                      type="number"
                      value={renewDiscount}
                      onChange={(e) => setRenewDiscount(e.target.value)}
                      className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {Number(renewDiscount) > 0 && (
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Discount Note</label>
                    <input
                      type="text"
                      required
                      value={renewDiscountNote}
                      onChange={(e) => setRenewDiscountNote(e.target.value)}
                      placeholder="e.g. Student discount"
                      className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="bg-muted/40 p-3 rounded-xl text-xs font-bold text-muted-foreground flex justify-between">
                  <span>Net Payable:</span>
                  <span className="text-foreground">
                    {formatCurrency(Math.max((Number(renewFee) || 0) - (Number(renewDiscount) || 0), 0))}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">First Payment</label>
                    <input
                      type="number"
                      value={renewPayment}
                      onChange={(e) => setRenewPayment(e.target.value)}
                      className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Payment Mode</label>
                    <select
                      value={renewMode}
                      onChange={(e) => setRenewMode(e.target.value)}
                      className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {Number(renewPayment) < (Number(renewFee) - Number(renewDiscount)) && (
                  <div className="bg-warning/10 border border-warning/20 p-2.5 rounded-xl text-[11px] text-warning font-semibold">
                    {formatCurrency(Math.max((Number(renewFee) - Number(renewDiscount) - Number(renewPayment)), 0))} will remain as outstanding due.
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Notes</label>
                  <input
                    type="text"
                    value={renewNotes}
                    onChange={(e) => setRenewNotes(e.target.value)}
                    placeholder="Plan renewal notes"
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none"
                  />
                </div>
                <div className="flex gap-3 justify-end border-t pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setRenewOpen(false)}
                    className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-primary py-2.5 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign Membership'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Record Subsequent Payment Modal */}
      {paymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-md font-bold text-foreground">Record Subsequent Payment</h3>
              <button onClick={() => setPaymentOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Amount *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2.5 px-3 text-sm outline-none"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Note / Remark</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Paid in cash directly"
                  className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setPaymentOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-primary py-2 px-5 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
