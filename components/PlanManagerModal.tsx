'use client';

import React, { useState } from 'react';
import { X, Check, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface PlanManagerModalProps {
  gym: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedGym: any) => void;
}

const PLANS = [
  {
    id: 'FREE',
    name: 'Free Tier',
    description: 'Basic gym setup with member management and manual check-ins.',
    color: 'border-slate-700 bg-slate-800/60 text-slate-300',
    badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    icon: Shield,
    features: ['Member Management', 'Manual Attendance'],
  },
  {
    id: 'BASIC',
    name: 'Basic Plan',
    description: 'Includes automated SMS/WhatsApp alerts and QR check-ins.',
    color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-200',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: Zap,
    features: ['Member Management', 'QR & Manual Check-in', 'SMS & WhatsApp Alerts'],
  },
  {
    id: 'PREMIUM',
    name: 'Premium Plan',
    description: 'Full feature access including LAN Biometric LAN readers & ADMS push sync.',
    color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200',
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: Sparkles,
    features: [
      'All Basic Features',
      'Online Payments & Reports',
      'Biometric LAN & ADMS Sync',
    ],
  },
];

export default function PlanManagerModal({ gym, isOpen, onClose, onSuccess }: PlanManagerModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'BASIC' | 'PREMIUM'>(
    gym?.subscription_plan || gym?.subscriptionPlan || 'FREE'
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen || !gym) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const gymId = gym.id || gym.gymId;
      await apiClient(`/admin/gyms/${gymId}/plan`, {
        method: 'PATCH',
        body: JSON.stringify({ subscription_plan: selectedPlan }),
      });
      toast.success(`Updated ${gym.gym_name || gym.gymName} subscription plan to ${selectedPlan}`);
      onSuccess({
        ...gym,
        subscription_plan: selectedPlan,
        subscriptionPlan: selectedPlan,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan tier');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow effect header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500" />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Change Subscription Plan</h2>
            <p className="text-xs text-slate-400 mt-1">
              Updating plan for <strong className="text-slate-200">{gym.gym_name || gym.gymName}</strong> ({gym.owner_name || gym.ownerName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan selection cards */}
        <div className="space-y-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id as any)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  isSelected
                    ? `${plan.color} ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10`
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div
                  className={`p-3 rounded-xl border ${
                    isSelected ? plan.badgeBg : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{plan.name}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Check className="h-3.5 w-3.5" /> Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{plan.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {plan.features.map((f, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Plan...
              </>
            ) : (
              'Confirm Plan Change'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
