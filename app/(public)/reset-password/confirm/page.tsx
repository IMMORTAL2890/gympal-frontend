'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell, Lock, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

function ConfirmResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');


  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token. Please request a new link.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute w-72 h-72 rounded-full bg-success filter blur-3xl -top-20 -left-20 animate-float-bubble" />
        <div className="absolute w-96 h-96 rounded-full bg-primary filter blur-3xl -bottom-30 -right-20 animate-float-bubble" style={{ animationDelay: '3s' }} />
      </div>

      <div className="z-10 w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 border border-success/35">
            <Dumbbell className="h-6 w-6 text-success" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Fit<span className="text-success">Track</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Reset Password'}
              <CheckCircle2 className="h-4 w-4 ml-1" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-fade-in">
            <CheckCircle2 className="h-16 w-16 text-success animate-pulse-glow rounded-full" />
            <h3 className="text-lg font-bold text-foreground">Password Reset Successful</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm cursor-pointer"
            >
              Go to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="h-8 w-8 text-success animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmResetPasswordContent />
    </Suspense>
  );
}
