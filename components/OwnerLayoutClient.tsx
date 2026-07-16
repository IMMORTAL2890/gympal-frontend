'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Dumbbell, LayoutDashboard, Users, ClipboardList, 
  Receipt, Clock, Bell, Settings, LogOut, Menu, 
  X, ChevronLeft, ChevronRight, CheckCircle2, Loader2, Phone,
  Sun, Moon, Lock
} from 'lucide-react';
import { clearTokens } from '@/lib/auth/auth-store';
import { apiClient } from '@/lib/api/client';
import { setupGymAction } from '@/app/actions';
import { toast } from 'sonner';

const FEATURE_MAP: Record<string, string> = {
  '/members': 'MEMBER_MANAGEMENT',
  '/plans': 'MEMBER_MANAGEMENT',
  '/transactions': 'ONLINE_PAYMENTS',
  '/attendance': 'ATTENDANCE_CHECKIN',
  '/alerts': 'SMS_WHATSAPP_NOTIFICATIONS'
};

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Members', path: '/members', icon: Users },
  { label: 'Plans', path: '/plans', icon: ClipboardList },
  { label: 'Payments', path: '/transactions', icon: Receipt },
  { label: 'Attendance', path: '/attendance', icon: Clock },
  { label: 'Alerts', path: '/alerts', icon: Bell },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface OwnerLayoutClientProps {
  initialMe: any;
  initialAlerts: any;
  children: React.ReactNode;
}

export default function OwnerLayoutClient({ initialMe, initialAlerts, children }: OwnerLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Theme Sync on Mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fittrack:theme') || 'light';
    console.log("[FitTrack Theme] Initializing theme on mount:", savedTheme);
    setTheme(savedTheme as 'light' | 'dark');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log("[FitTrack Theme] Button clicked. Toggling theme from", theme, "to", newTheme);
    setTheme(newTheme);
    localStorage.setItem('fittrack:theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log("[FitTrack Theme] Document classList updated to include 'dark':", document.documentElement.className);
    } else {
      document.documentElement.classList.remove('dark');
      console.log("[FitTrack Theme] Document classList updated to remove 'dark':", document.documentElement.className);
    }
  };

  // Gym setup state
  const [setupOpen, setSetupOpen] = useState(!initialMe?.gym);
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Notification bell polling state
  const [totalAlerts, setTotalAlerts] = useState(
    (initialAlerts?.expiring?.length || 0) + (initialAlerts?.dues?.length || 0)
  );

  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    if (initialMe?.gym) {
      apiClient('/gym/features')
        .then(data => setFeatures(data || []))
        .catch(() => {});
    }
  }, [initialMe]);

  const isEnabled = (path: string) => {
    const key = FEATURE_MAP[path];
    if (!key) return true;
    const feat = features.find(f => f.featureKey === key);
    return feat ? feat.enabled : true;
  };

  // Load sidebar preference from local storage
  useEffect(() => {
    const collapsed = localStorage.getItem('fittrack:sidebar-collapsed');
    if (collapsed === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  // Update setupOpen state if initialMe changes
  useEffect(() => {
    setSetupOpen(!initialMe?.gym);
  }, [initialMe]);

  // Periodically poll alerts count (every 30 seconds) using native useEffect + fetch
  useEffect(() => {
    if (!initialMe?.gym) return;

    const pollAlerts = async () => {
      try {
        const data = await apiClient('/alerts');
        const count = (data?.expiring?.length || 0) + (data?.dues?.length || 0);
        setTotalAlerts(count);
      } catch (e) {
        // fail silently for poll
      }
    };

    const interval = setInterval(pollAlerts, 30000);
    return () => clearInterval(interval);
  }, [initialMe]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymName || !ownerName || !mobile) {
      toast.error('All fields are required');
      return;
    }
    if (!mobile.match(/^[0-9+\-\s]{7,15}$/)) {
      toast.error('Enter a valid mobile number (7-15 digits)');
      return;
    }

    setSetupLoading(true);
    try {
      await setupGymAction({ gymName, ownerName, mobile });
      toast.success('Gym registered successfully!');
      setSetupOpen(false);
      router.refresh(); // Triggers server components refresh
    } catch (err: any) {
      toast.error(err.message || 'Setup failed. Please try again.');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSignOut = () => {
    clearTokens();
    toast.success('Logged out successfully');
    router.replace('/auth');
  };

  const toggleSidebar = () => {
    const nextVal = !sidebarCollapsed;
    setSidebarCollapsed(nextVal);
    localStorage.setItem('fittrack:sidebar-collapsed', String(nextVal));
    localStorage.setItem('fittrack:sidebar-hint-dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* 1. Onboarding Modal Guard (non-dismissible if no gym profile exists) */}
      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-8 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 border border-success/35">
                <Dumbbell className="h-6 w-6 text-success animate-pulse-glow" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">Complete Gym Setup</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your gym profile to begin tracking members.
              </p>
            </div>

            <form onSubmit={handleSetupSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Gym Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Iron Gym Central"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full rounded-xl border bg-background py-2.5 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Arjun Sharma"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-xl border bg-background py-2.5 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={setupLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3 px-4 text-sm font-bold text-success-foreground hover:bg-success/95 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {setupLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Save & Initialize Gym
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-sidebar-bg text-sidebar-fg transition-all duration-250 z-20 shrink-0 border-r border-sidebar-accent/30 ${
          sidebarCollapsed ? 'w-15' : 'w-55'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-accent/30">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <Dumbbell className="h-5 w-5 text-success" />
              <span className="font-extrabold text-white text-lg tracking-wide">FitTrack</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mx-auto">
              <Dumbbell className="h-5 w-5 text-success" />
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            const active = isEnabled(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-sidebar-accent text-white shadow-sm' 
                    : 'hover:bg-sidebar-accent/50 hover:text-white/90 text-sidebar-fg/80'
                } ${!active ? 'opacity-60 hover:opacity-80' : ''}`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {!active && !sidebarCollapsed && <Lock className="ml-auto h-3.5 w-3.5 text-slate-500" />}
                {!sidebarCollapsed && active && item.label === 'Alerts' && totalAlerts > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer sign out */}
        <div className="p-3 border-t border-sidebar-accent/30">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-sidebar-fg/70 hover:bg-sidebar-accent/40 hover:text-destructive transition-colors cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 3. Mobile Header & Top Nav */}
      <header className="lg:hidden flex h-14 items-center justify-between bg-sidebar-bg text-sidebar-fg px-4 sticky top-0 z-30 shadow-sm border-b border-sidebar-accent/20">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-success animate-pulse-glow rounded-full" />
          <span className="font-extrabold text-white text-md tracking-wide">FitTrack</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4.5 w-4.5 text-sidebar-fg" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-sidebar-fg" />
            )}
          </button>

          {/* Mobile Alerts Bell */}
          <button 
            onClick={() => router.push('/alerts')}
            className="relative p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <Bell className="h-4.5 w-4.5 text-sidebar-fg" />
            {totalAlerts > 0 && (
              <span className="absolute top-0 right-0 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-sidebar-bg text-sidebar-fg z-20 border-b border-sidebar-accent/40 shadow-lg p-4 space-y-2 animate-fade-in">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            const active = isEnabled(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(item.path);
                }}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-sidebar-accent text-white' : 'text-sidebar-fg/80 hover:bg-sidebar-accent/30'
                } ${!active ? 'opacity-60' : ''}`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
                {!active && <Lock className="ml-auto h-3.5 w-3.5 text-slate-500" />}
                {active && item.label === 'Alerts' && totalAlerts > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalAlerts}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleSignOut();
            }}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive/80 hover:bg-sidebar-accent/30 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* 4. Desktop Top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden lg:flex h-16 items-center justify-between border-b bg-white px-6 sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {initialMe?.gym?.gymName || 'Loading Gym...'}
            </span>
            <span className="text-xs text-muted-foreground">
              Owner: {initialMe?.gym?.ownerName || 'Owner'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              )}
            </button>

            {/* Desktop Alerts Bell Button */}
            <button
              onClick={() => router.push('/alerts')}
              className="relative p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
            >
              <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              {totalAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                  {totalAlerts}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* 5. Main content viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8 safe-pb container mx-auto">
          {isEnabled(pathname) ? (
            children
          ) : (
            <div className="bg-white border rounded-3xl p-12 text-center max-w-lg mx-auto my-12 space-y-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-foreground dark:text-white">Module Feature Locked</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This feature is currently not enabled under your subscription plan preset tier. Please contact the system administrator to upgrade your gym branch subscription.
              </p>
            </div>
          )}
        </main>

        {/* 6. Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-sidebar-bg text-sidebar-fg border-t border-sidebar-accent/15 z-30 flex items-center justify-around h-15 pb-safe">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            const active = isEnabled(item.path);
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-[9px] xs:text-[10px] cursor-pointer ${
                  isActive ? 'text-success' : 'text-sidebar-fg/60 hover:text-sidebar-fg/80'
                } ${!active ? 'opacity-65' : ''}`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5 shrink-0" />
                  {!active && (
                    <span className="absolute -top-1 -left-1 bg-slate-900 border border-slate-750 p-0.5 rounded-full text-slate-400">
                      <Lock className="h-2 w-2" />
                    </span>
                  )}
                  {item.label === 'Alerts' && totalAlerts > 0 && active && (
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-destructive text-[6px] font-bold text-destructive-foreground">
                      {totalAlerts}
                    </span>
                  )}
                </div>
                <span className="truncate max-w-[50px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
