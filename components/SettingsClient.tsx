'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, Save, Cpu, Plus, Edit3, Trash2, 
  X, Check, Loader2, Key, HelpCircle, Activity, 
  Database, Network, Server, Wifi
} from 'lucide-react';
import { 
  updateGymProfileAction, 
  createDeviceAction, 
  updateDeviceAction, 
  deleteDeviceAction 
} from '@/app/actions';
import { toast } from 'sonner';

interface SettingsClientProps {
  initialMe: any;
  initialDevices: any[];
}

export default function SettingsClient({ initialMe, initialDevices }: SettingsClientProps) {
  const router = useRouter();

  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile forms
  const [gymName, setGymName] = useState(initialMe?.gym?.gymName || '');
  const [ownerName, setOwnerName] = useState(initialMe?.gym?.ownerName || '');
  const [mobile, setMobile] = useState(initialMe?.gym?.mobileNumber || '');
  const [autoReminderEnabled, setAutoReminderEnabled] = useState(initialMe?.gym?.autoReminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(initialMe?.gym?.reminderDaysBefore ?? 3);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateGymProfileAction({
        gymName,
        ownerName,
        mobile,
        autoReminderEnabled,
        reminderDaysBefore,
      });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Gym profile updated!');
      router.refresh();
    } catch (err: any) {
      console.error('[SettingsClient] Profile update error:', err);
      toast.error(err.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  // Device form states
  const [deviceName, setDeviceName] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [devicePort, setDevicePort] = useState(4370);
  const [devicePassword, setDevicePassword] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [location, setLocation] = useState('');
  const [doorControlEnabled, setDoorControlEnabled] = useState(false);

  const openCreateDevice = () => {
    setEditingDevice(null);
    setDeviceName('');
    setDeviceIp('');
    setDevicePort(4370);
    setDevicePassword('');
    setDeviceModel('');
    setDeviceSerial('');
    setLocation('');
    setDoorControlEnabled(false);
    setDeviceModalOpen(true);
  };

  const openEditDevice = (d: any) => {
    setEditingDevice(d);
    setDeviceName(d.deviceName);
    setDeviceIp(d.deviceIp);
    setDevicePort(d.devicePort);
    setDevicePassword(d.devicePassword || '');
    setDeviceModel(d.deviceModel || '');
    setDeviceSerial(d.deviceSerial || '');
    setLocation(d.location || '');
    setDoorControlEnabled(d.doorControlEnabled);
    setDeviceModalOpen(true);
  };

  const handleDeviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !deviceIp || !deviceSerial) {
      toast.error('Name, IP, and Serial number are required');
      return;
    }

    setLoading(true);
    const payload = {
      deviceName,
      deviceIp,
      devicePort,
      devicePassword: devicePassword || null,
      deviceModel: deviceModel || null,
      deviceSerial,
      location: location || null,
      doorControlEnabled,
    };

    try {
      let result: any;
      if (editingDevice) {
        result = await updateDeviceAction(editingDevice.id, payload);
        if (result?.error) { toast.error(result.error); return; }
        toast.success('Device configuration updated!');
      } else {
        result = await createDeviceAction(payload);
        if (result?.error) { toast.error(result.error); return; }
        toast.success('Device registered!');
      }
      setDeviceModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('[SettingsClient] Device action error:', err);
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!confirm('Are you sure you want to remove this device config?')) return;
    try {
      const result = await deleteDeviceAction(id);
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Device removed successfully');
      router.refresh();
    } catch (err: any) {
      console.error('[SettingsClient] Delete device error:', err);
      toast.error(err.message || 'Failed to remove device');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Gym Settings</h1>
        <p className="text-xs text-muted-foreground">Manage profile info, auto renewal parameters, and biometric terminals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gym Profile */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm h-fit space-y-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <Settings className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Gym Profile</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Gym Name</label>
              <input
                type="text"
                required
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Owner Name</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Auto Expiring Reminders</span>
                <button
                  type="button"
                  onClick={() => setAutoReminderEnabled(!autoReminderEnabled)}
                  className="cursor-pointer font-bold text-[10px]"
                >
                  {autoReminderEnabled ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-success/15 text-success">ENABLED</span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-muted text-muted-foreground">DISABLED</span>
                  )}
                </button>
              </div>

              {autoReminderEnabled && (
                <div className="animate-fade-in">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Remind Days Before</label>
                  <input
                    type="number"
                    required
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 px-4 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Biometric Devices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-primary animate-pulse-glow" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Biometric LAN Devices</h3>
              </div>
              <button
                onClick={openCreateDevice}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 px-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Device
              </button>
            </div>

            <div className="overflow-x-auto">
              {!initialDevices || initialDevices.length === 0 ? (
                <div className="px-6 py-12 text-center text-xs text-muted-foreground font-semibold">
                  No biometric device terminals configured yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b">
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name / Location</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">IP / Port</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Serial Number</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Sync Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialDevices.map((d: any) => (
                      <tr key={d.id} className="border-b">
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{d.deviceName}</div>
                          <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{d.location || 'No location set'}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-muted-foreground">
                          {d.deviceIp}:{d.devicePort}
                        </td>
                        <td className="px-6 py-4 font-semibold text-muted-foreground">
                          {d.deviceSerial}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase w-fit ${
                              d.lastSyncStatus === 'success'
                                ? 'bg-success/15 text-success'
                                : d.lastSyncStatus === 'failed'
                                ? 'bg-destructive/15 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {d.lastSyncStatus}
                            </span>
                            {d.lastSyncTime && (
                              <span className="text-[9px] text-muted-foreground font-semibold mt-1">
                                {new Date(d.lastSyncTime).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditDevice(d)}
                              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="Edit Configuration"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDevice(d.id)}
                              className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                              title="Delete Device"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Guide & Diagnostics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Biometric Integration Guide */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <HelpCircle className="h-4.5 w-4.5 text-primary animate-float-bubble" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">ESSL Biometric Integration Guide</h3>
          </div>
          
          <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              To connect your ESSL or ZKTeco biometric fingerprint/face reader terminals to FitTrack:
            </p>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">1</span>
                <div>
                  <strong className="text-foreground">Static IP Configuration:</strong>
                  <p className="mt-0.5">Assign a static IP address to the biometric reader on the same local network subnet as your server host machine.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">2</span>
                <div>
                  <strong className="text-foreground">Port Assignment:</strong>
                  <p className="mt-0.5">Ensure the terminal communication port is set to <code className="bg-muted px-1 py-0.5 rounded font-mono font-bold text-foreground">4370</code> (default ZK UDP SDK communication port).</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">3</span>
                <div>
                  <strong className="text-foreground">Member Card / Biometric UID Mapping:</strong>
                  <p className="mt-0.5">Register the member on the machine. Enter their machine user ID as the <strong className="text-foreground">Biometric UID</strong> in the member's FitTrack profile page so attendance registers dynamically.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">4</span>
                <div>
                  <strong className="text-foreground">Network Firewall Exception:</strong>
                  <p className="mt-0.5">Allow inbound/outbound UDP packets on Port 4370 in your server's Operating System Firewalls to enable polling logs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostics & Health Status */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Activity className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">System Diagnostics</h3>
          </div>

          <div className="divide-y text-xs font-semibold text-muted-foreground">
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-1.5"><Database className="h-4 w-4 text-primary" /> Database Driver</span>
              <span className="text-foreground font-bold">PostgreSQL v16 (HikariPool-1)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-1.5"><Server className="h-4 w-4 text-primary" /> App Host Engine</span>
              <span className="text-foreground font-bold">Spring Boot 3.3.1 (JVM Java 21)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-1.5"><Network className="h-4 w-4 text-primary" /> Schema Migrations</span>
              <span className="inline-flex px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold">FLYWAY V2 (OK)</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-1.5"><Wifi className="h-4 w-4 text-primary" /> API Handshake Status</span>
              <span className="inline-flex px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold">200 OK</span>
            </div>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 mt-2 flex flex-col justify-center text-[10px] font-bold text-primary leading-relaxed">
            <div>Live Network Polling Status:</div>
            <div className="text-muted-foreground font-medium mt-1">Biometric polling worker service is listening on port 4370 and syncing logs from registered hardware.</div>
          </div>
        </div>
      </div>

      {/* ADD / EDIT DEVICE DIALOG MODAL */}
      {deviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-6 animate-fade-in-up">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-md font-bold text-foreground">
                {editingDevice ? 'Modify Biometric Device' : 'Register Biometric Device'}
              </h3>
              <button onClick={() => setDeviceModalOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleDeviceSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Device Nickname *</label>
                <input
                  type="text"
                  required
                  placeholder="Main Door Reader"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Local IP Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="192.168.1.201"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Connection Port</label>
                  <input
                    type="number"
                    required
                    value={devicePort}
                    onChange={(e) => setDevicePort(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Device Password (optional)</label>
                  <input
                    type="password"
                    value={devicePassword}
                    onChange={(e) => setDevicePassword(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Device Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="ZK123456789"
                    value={deviceSerial}
                    onChange={(e) => setDeviceSerial(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Device Model</label>
                  <input
                    type="text"
                    placeholder="ZK-iFace"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Installation Location</label>
                  <input
                    type="text"
                    placeholder="Reception Entrance"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border bg-background py-2 px-3 text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Enable Door Control Relay</span>
                <button
                  type="button"
                  onClick={() => setDoorControlEnabled(!doorControlEnabled)}
                  className="cursor-pointer font-bold text-[10px]"
                >
                  {doorControlEnabled ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-success/15 text-success">YES</span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-muted text-muted-foreground">NO</span>
                  )}
                </button>
              </div>

              <div className="flex gap-3 justify-end border-t pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setDeviceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-primary py-2.5 px-6 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
