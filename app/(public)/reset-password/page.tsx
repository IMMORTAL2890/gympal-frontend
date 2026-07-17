'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
      toast.success('Password reset link sent to your email!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
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
            Reset your gym owner account password
          </p>
        </div>

        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@mygym.com"
                  className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              <Send className="h-4 w-4 ml-1" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-fade-in">
            <CheckCircle2 className="h-16 w-16 text-success animate-pulse-glow rounded-full" />
            <h3 className="text-lg font-bold text-foreground">Instructions Sent</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              We have sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Please check your inbox and spam folders.
            </p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
