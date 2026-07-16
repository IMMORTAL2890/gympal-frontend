'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { setTokens, clearTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.user.role !== 'ADMIN') {
        clearTokens();
        toast.error('Access denied. Not a platform admin.');
        setLoading(false);
        return;
      }

      setTokens(data.accessToken, data.refreshToken, data.user);
      toast.success('Access granted. Welcome to Ops Portal!');
      router.replace('/ops-7f3k');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4 overflow-hidden">
      {/* Background circles */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500 filter blur-3xl -top-20 -left-20" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500 filter blur-3xl -bottom-30 -right-20" />
      </div>

      <div className="z-10 w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl space-y-6">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Dumbbell className="h-6 w-6 text-indigo-400" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            FitTrack <span className="text-indigo-400">Ops Console</span>
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Platform super-admin console routing.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Admin Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fittrack.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white hover:bg-indigo-500 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                Sign In to Console
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
