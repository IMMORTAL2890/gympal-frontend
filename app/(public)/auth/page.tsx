'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, Lock, Loader2, ArrowRight, Phone, User } from 'lucide-react';
import { setTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Load Google Identity Services SDK script dynamically
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '788482819875-1u9o327vbeab0ncl0h7346u9e3k5a2u7.apps.googleusercontent.com';
      
      if (typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        if (googleBtnRef.current) {
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 380, // Render button full width matching our UI
            text: 'continue_with',
          });
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setGoogleLoading(true);
    try {
      const data = await apiClient('/auth/oauth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: response.credential }),
      });
      // Save only accessToken and user info
      setTokens(data.accessToken, data.user);
      toast.success('Signed in with Google!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Google OAuth failed');
    } finally {
      setGoogleLoading(false);
    }
  };

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

    if (!isLogin) {
      if (!gymName || !ownerName || !mobile) {
        toast.error('Please fill in all gym onboarding fields');
        return;
      }
      if (!mobile.match(/^[0-9+\-\s]{7,15}$/)) {
        toast.error('Enter a valid mobile number (7-15 digits)');
        return;
      }
    }

    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    const requestBody = isLogin 
      ? { email, password } 
      : { email, password, gymName, ownerName, mobile };

    try {
      const data = await apiClient(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      // Save only accessToken and user info (removed refreshToken)
      setTokens(data.accessToken, data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created and Gym setup successfully!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
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

          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Gym Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Dumbbell className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    placeholder="Iron Gym Central"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Owner Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Arjun Sharma"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </>
          )}

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

        <div className="w-full flex justify-center min-h-[46px]" ref={googleBtnRef} />

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
