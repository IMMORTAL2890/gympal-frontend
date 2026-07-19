'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Phone, CheckCircle2, Loader2, LogOut } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-success" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration bubbles */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute w-72 h-72 rounded-full bg-success filter blur-3xl -top-20 -left-20 animate-float-bubble" />
        <div className="absolute w-96 h-96 rounded-full bg-primary filter blur-3xl -bottom-30 -right-20 animate-float-bubble" style={{ animationDelay: '3s' }} />
      </div>

      <div className="z-10 w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 border border-success/35">
            <Dumbbell className="h-6 w-6 text-success animate-pulse-glow" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground dark:text-white">Complete Gym Setup</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Set up your gym profile to begin tracking members.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Gym Name
            </label>
            <input
              type="text"
              required
              placeholder="Iron Gym Central"
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              className="w-full rounded-xl border bg-background py-2.5 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Owner Name
            </label>
            <input
              type="text"
              required
              placeholder="Arjun Sharma"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full rounded-xl border bg-background py-2.5 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3 px-4 text-sm font-bold text-success-foreground hover:bg-success/95 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4.5 w-4.5" />
                Save & Initialize Gym
              </>
            )}
          </button>
        </form>

        <div className="border-t pt-4 text-center">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
