'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, Lock } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { status?: number; digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Admin Area Error]', {
      message: error.message,
      status: error.status,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 space-y-5 bg-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/30">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Admin Portal Error</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {error.message || 'An unexpected error occurred. The admin action failed.'}
        </p>
        {error.digest && (
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <button
          onClick={() => router.push('/ops-7f3k')}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted transition-all cursor-pointer"
        >
          <Lock className="h-4 w-4" />
          Admin Home
        </button>
      </div>
    </div>
  );
}
