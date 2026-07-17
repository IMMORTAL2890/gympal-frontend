'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit3, ClipboardList, ToggleLeft, ToggleRight, X, Loader2, Save } from 'lucide-react';
import { createPlanAction, updatePlanAction } from '@/app/actions';
import { toast } from 'sonner';

interface PlansClientProps {
  initialPlans: any[];
}

export default function PlansClient({ initialPlans }: PlansClientProps) {
  const router = useRouter();

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  // Form states
  const [planName, setPlanName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setDurationDays('');
    setPrice('');
    setDescription('');
    setIsActive(true);
    setPlanModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingPlan(p);
    setPlanName(p.planName);
    setDurationDays(String(p.durationDays));
    setPrice(String(p.price));
    setDescription(p.description || '');
    setIsActive(p.isActive);
    setPlanModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !durationDays || !price) {
      toast.error('All required fields must be filled');
      return;
    }

    setLoading(true);
    const payload = {
      planName,
      durationDays: parseInt(durationDays, 10),
      price: parseFloat(price),
      description: description || null,
      isActive,
    };
    try {
      let result: any;
      if (editingPlan) {
        result = await updatePlanAction(editingPlan.id, payload);
        if (result?.error) { toast.error(result.error); return; }
        toast.success('Plan updated successfully!');
      } else {
        result = await createPlanAction(payload);
        if (result?.error) { toast.error(result.error); return; }
        toast.success('Plan created successfully!');
      }
      setPlanModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('[PlansClient] Action error:', err);
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (p: any) => {
    try {
      const result = await updatePlanAction(p.id, { isActive: !p.isActive });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Plan status updated!');
      router.refresh();
    } catch (err: any) {
      console.error('[PlansClient] Toggle error:', err);
      toast.error(err.message || 'Toggle failed');
    }
  };

  const formatCurrency = (val: number) => {
    return '₹' + new Intl.NumberFormat('en-IN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Membership Plans</h1>
          <p className="text-xs text-muted-foreground">Manage gym packages, durations, pricing, and view subscriber levels.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Plan
        </button>
      </div>

      {!initialPlans || initialPlans.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="text-md font-bold text-foreground">No plans registered</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create membership packages (e.g. Monthly, Quarterly, Annual) to renew gym subscribers.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialPlans.map((p: any) => (
            <div 
              key={p.id} 
              className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative ${
                !p.isActive ? 'opacity-65' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between border-b pb-3 mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-foreground truncate max-w-[150px]">{p.planName}</h3>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      {p.durationDays} Days Duration
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-foreground">{formatCurrency(p.price)}</div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Rate</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground font-medium min-h-[40px] line-clamp-3">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t pt-4 mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Active Subscribers</span>
                  <span className="text-sm font-bold text-foreground">{p.activeMembershipsCount} Members</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(p)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={p.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                  >
                    {p.isActive ? (
                      <ToggleRight className="h-6 w-6 text-success" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(p)}
                    className="p-2 rounded-lg border bg-white text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-pointer shadow-sm transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT DIALOG MODAL */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-md font-bold text-foreground">
                {editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}
              </h3>
              <button onClick={() => setPlanModalOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Standard"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Price Rate *</label>
                  <input
                    type="number"
                    required
                    placeholder="1500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Details about standard workout sessions, trainer assistance, access times, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border bg-background py-2 px-3 text-sm outline-none focus:border-primary"
                />
              </div>

              {editingPlan && (
                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Plan Active Status</span>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className="cursor-pointer"
                  >
                    {isActive ? (
                      <ToggleRight className="h-6 w-6 text-success" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                </div>
              )}

              <div className="flex gap-3 justify-end border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-primary py-2.5 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingPlan ? 'Update Package' : 'Publish Package'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
