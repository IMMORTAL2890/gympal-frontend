'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Phone, CheckCircle2, Loader2, LogOut, User, Building, Check, ArrowRight } from 'lucide-react';
import { setupGymAction } from '@/app/actions';
import { clearTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '@/lib/utils/error-handler';

export default function SetupPage() {
  const router = useRouter();
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Guard: if user is not logged in, redirect to auth.
  // If they already have a gym, redirect to dashboard.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await apiClient('/me');
        if (me?.gym) {
          router.replace('/dashboard');
        } else {
          setChecking(false);
        }
      } catch (err) {
        toast.error('Session expired. Please log in again.');
        clearTokens();
        router.replace('/auth');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName || !ownerName || !mobile) {
      toast.error('All fields are required');
      return;
    }
    if (!mobile.match(/^[0-9+\-\s]{7,15}$/)) {
      toast.error('Enter a valid mobile number (7-15 digits)');
      return;
    }

    setLoading(true);
    try {
      const result = await setupGymAction({ gymName, ownerName, mobile });
      if (result && (result as any).error) {
        toast.error(getFriendlyErrorMessage((result as any).error));
        return;
      }
      toast.success('Gym registered successfully!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    clearTokens();
    toast.success('Logged out successfully');
    router.replace('/auth');
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-success" />
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">Verifying Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium ambient light background mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/10 filter blur-[120px] -top-80 -left-60 animate-float-bubble" />
        <div className="absolute w-[700px] h-[700px] rounded-full bg-indigo-500/10 filter blur-[150px] -bottom-90 -right-40 animate-float-bubble" style={{ animationDelay: '3s' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-success/5 filter blur-[100px] top-1/2 left-1/3 animate-float-bubble" style={{ animationDelay: '6s' }} />
      </div>

      {/* Main glass card wrapper container */}
      <div className="z-10 w-full max-w-md bg-slate-900/60 dark:bg-slate-950/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-slate-800/80 shadow-[0_0_80px_-15px_rgba(16,185,129,0.15)] transition-all duration-300 transform hover:scale-[1.01] animate-fade-in-up">
        {/* Onboarding steps indicator progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success text-[10px] font-bold border border-success/30">
              <Check className="h-3 w-3" />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Account</span>
          </div>
          <div className="flex-1 h-[2px] bg-success/30 mx-3 rounded" />
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-slate-950 text-[10px] font-bold shadow-[0_0_10px_rgba(34,197,94,0.4)]">
              2
            </div>
            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Gym Profile</span>
          </div>
          <div className="flex-1 h-[2px] bg-slate-800 mx-3 rounded" />
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-700/50">
              3
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Dashboard</span>
          </div>
        </div>

        {/* Brand visual header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 border border-success/25 shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-pulse-glow">
            <Dumbbell className="h-7 w-7 text-success" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-white tracking-tight">Complete Gym Setup</h2>
          <p className="mt-2 text-xs text-slate-400 font-medium max-w-[280px]">
            Set up your professional gym management profile to start tracking your members today.
          </p>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
              Gym Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-success transition-colors" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Iron Gym Central"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-success focus:ring-1 focus:ring-success outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
              Owner Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-success transition-colors" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Arjun Sharma"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-success focus:ring-1 focus:ring-success outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">
              Owner Mobile Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone className="h-4.5 w-4.5 text-slate-500 group-focus-within:text-success transition-colors" />
              </div>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:border-success focus:ring-1 focus:ring-success outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-success py-3.5 px-4 text-sm font-bold text-slate-950 hover:bg-success/90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 shadow-[0_4px_20px_rgba(34,197,94,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <span>Save & Start Onboarding</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800/60 mt-6 pt-5 text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out & Exit Setup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
