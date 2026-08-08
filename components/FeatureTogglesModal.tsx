'use client';

import React, { useState } from 'react';
import { X, Sliders, Users, CalendarCheck, CreditCard, MessageSquare, Cpu, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface FeatureTogglesModalProps {
  gym: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const FEATURE_DEFINITIONS = [
  {
    key: 'MEMBER_MANAGEMENT',
    title: 'Member Management',
    description: 'Members & Membership Plans access',
    icon: Users,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    key: 'ATTENDANCE_CHECKIN',
    title: 'Attendance Check-in',
    description: 'Manual & QR Check-ins processing',
    icon: CalendarCheck,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    key: 'ONLINE_PAYMENTS',
    title: 'Online Payments',
    description: 'Payment Receipts & Revenue Reports',
    icon: CreditCard,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    key: 'SMS_WHATSAPP_NOTIFICATIONS',
    title: 'SMS & WhatsApp Notifications',
    description: 'Expiry Alerts & WhatsApp Reminders',
    icon: MessageSquare,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    key: 'MACHINE_INTEGRATION',
    title: 'Machine Integration',
    description: 'Biometric LAN Readers & ADMS Push Direct Sync',
    icon: Cpu,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
];

export default function FeatureTogglesModal({ gym, isOpen, onClose, onUpdate }: FeatureTogglesModalProps) {
  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    if (gym?.features) return gym.features;
    return {
      MEMBER_MANAGEMENT: true,
      ATTENDANCE_CHECKIN: true,
      ONLINE_PAYMENTS: true,
      SMS_WHATSAPP_NOTIFICATIONS: true,
      MACHINE_INTEGRATION: true,
    };
  });
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  if (!isOpen || !gym) return null;

  const gymId = gym.id || gym.gymId;

  const handleToggle = async (key: string) => {
    const currentVal = features[key] ?? true;
    const newVal = !currentVal;
    setUpdatingKey(key);

    try {
      await apiClient(`/admin/gyms/${gymId}/features`, {
        method: 'POST',
        body: JSON.stringify({
          feature_key: key,
          enabled: newVal,
          updated_by: 'Super Admin',
        }),
      });

      setFeatures((prev) => ({ ...prev, [key]: newVal }));
      toast.success(
        `${key} feature ${newVal ? 'ENABLED' : 'DISABLED'} for ${gym.gym_name || gym.gymName}`
      );
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || `Failed to toggle ${key}`);
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-emerald-500 to-cyan-500" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Per-Gym Feature Overrides</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Managing modules for <strong className="text-slate-200">{gym.gym_name || gym.gymName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feature Switches */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {FEATURE_DEFINITIONS.map((item) => {
            const Icon = item.icon;
            const isEnabled = features[item.key] ?? true;
            const isUpdating = updatingKey === item.key;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/30 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{item.title}</span>
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                        {item.key}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item.key)}
                    disabled={isUpdating}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <span
                    className={`text-xs font-semibold w-16 text-right ${
                      isEnabled ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-auto text-violet-400" />
                    ) : isEnabled ? (
                      'ENABLED'
                    ) : (
                      'DISABLED'
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Client permissions polled every 10s</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
