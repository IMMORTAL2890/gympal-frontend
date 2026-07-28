import React from 'react';
import { Loader2 } from 'lucide-react';

export default function OwnerLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-success" />
        <div className="absolute inset-0 rounded-full border-2 border-success/10 animate-ping" style={{ animationDuration: '2s' }} />
      </div>
      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider animate-pulse mt-2">
        Loading module content...
      </span>
    </div>
  );
}
