'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Public Area Error]', {
      message: error.message,
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
        <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {error.message || 'An unexpected error occurred.'}
        </p>
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
          onClick={() => router.push('/auth')}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </button>
      </div>
    </div>
  );
}
