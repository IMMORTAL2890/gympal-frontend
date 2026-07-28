import React from 'react';
import { Loader2, Dumbbell } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none select-none">
        <div className="absolute w-72 h-72 rounded-full bg-success filter blur-3xl -top-10 -left-10" />
        <div className="absolute w-96 h-96 rounded-full bg-indigo-500 filter blur-3xl -bottom-20 -right-10" />
      </div>

      <div className="z-10 flex flex-col items-center gap-4 p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-[0_0_50px_-15px_rgba(16,185,129,0.25)] dark:bg-slate-950/60 dark:border-slate-800/80 backdrop-blur-xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 border border-success/35 shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-pulse-glow">
          <Dumbbell className="h-7 w-7 text-success animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="flex flex-col items-center gap-1.5 mt-2">
          <span className="text-sm font-black text-white tracking-wider uppercase">FitTrack</span>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-widest">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-success" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
