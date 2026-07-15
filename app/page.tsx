'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { isAuthenticated, getAccessToken } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';

export default function SplashPage() {
  const router = useRouter();
  const [loadingText, setLoadingText] = useState('Initializing FitTrack...');

  const performCheck = async () => {
    // Check if access token is available in local storage
    const token = getAccessToken();
    if (!token) {
      router.push('/auth');
      return;
    }

    try {
      setLoadingText('Verifying session...');
      // Validate session against backend
      await apiClient('/me');
      router.push('/dashboard');
    } catch (error) {
      setLoadingText('Session expired. Redirecting to login...');
      router.push('/auth');
    }
  };

  useEffect(() => {
    // Run the animation and check session
    const timer = setTimeout(() => {
      performCheck();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    performCheck();
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-primary overflow-hidden select-none">
      {/* Dynamic Animated background floating bubbles */}
      <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-success filter blur-3xl -top-10 -left-10 animate-float-bubble" />
        <div className="absolute w-96 h-96 rounded-full bg-success filter blur-3xl -bottom-20 -right-10 animate-float-bubble" style={{ animationDelay: '2s' }} />
        <div className="absolute w-60 h-60 rounded-full bg-primary-foreground filter blur-2xl top-1/2 left-1/3 animate-float-bubble" style={{ animationDelay: '4s' }} />
      </div>

      <div className="z-10 flex flex-col items-center justify-between h-[80vh] max-w-sm px-6 text-center">
        {/* Empty space to align logo centrally */}
        <div />

        {/* Logo and Brand Mark */}
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-success/15 border-2 border-success animate-pulse-glow">
            <Dumbbell className="w-12 h-12 text-success" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mt-2">
            Fit<span className="text-success">Track</span>
          </h1>
          <p className="text-sm font-medium text-sidebar-fg/80 max-w-xs">
            Premium Gym Management Platform
          </p>
        </div>

        {/* Loading progress bar & text */}
        <div className="flex flex-col items-center w-full gap-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full animate-progress-fill" />
          </div>
          <p className="text-xs text-sidebar-fg/70 font-medium tracking-wide">
            {loadingText}
          </p>

          <button
            onClick={handleSkip}
            className="mt-6 text-xs font-semibold text-success hover:text-success/90 uppercase tracking-widest cursor-pointer py-2 px-4 rounded-lg hover:bg-white/5 transition-all duration-200"
          >
            Skip Intro &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
