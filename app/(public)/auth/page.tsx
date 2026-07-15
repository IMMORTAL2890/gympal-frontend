'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { setTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    try {
      const data = await apiClient(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setTokens(data.accessToken, data.refreshToken, data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      // Mock Google login by sending a mock token
      const mockEmail = email || 'google-demo-user@gympal.com';
      const data = await apiClient('/auth/oauth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: mockEmail }),
      });
      setTokens(data.accessToken, data.refreshToken, data.user);
      toast.success('Signed in with Google!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Google OAuth failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration bubbles */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div className="absolute w-72 h-72 rounded-full bg-success filter blur-3xl -top-20 -left-20 animate-float-bubble" />
        <div className="absolute w-96 h-96 rounded-full bg-primary filter blur-3xl -bottom-30 -right-20 animate-float-bubble" style={{ animationDelay: '3s' }} />
      </div>

      <div className="z-10 w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 border border-success/35">
            <Dumbbell className="h-6 w-6 text-success animate-pulse-glow" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
            Fit<span className="text-success">Track</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isLogin ? 'Sign in to manage your gym' : 'Create your owner account'}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {isLogin && (
            <div className="flex items-center justify-end text-xs">
              <button
                type="button"
                onClick={() => router.push('/reset-password')}
                className="font-medium text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Get Started'}
                <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-full border-t border-border" />
          <span className="relative bg-white px-3 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border bg-white py-2.5 px-4 text-sm font-medium text-foreground hover:bg-muted/30 transition-all duration-200 cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="text-center text-sm">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
