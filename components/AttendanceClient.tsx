'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, UserCheck, UserX, Cpu, X, BookOpen, AlertCircle } from 'lucide-react';

interface AttendanceClientProps {
  initialAttendance: any[];
  date: string;
}

export default function AttendanceClient({ initialAttendance, date }: AttendanceClientProps) {
  const router = useRouter();
  const [guideOpen, setGuideOpen] = useState(false);
  const [dateStr, setDateStr] = useState(date);

  const handleDateChange = (d: string) => {
    setDateStr(d);
    router.push(`/attendance?date=${d}`);
  };

  const total = initialAttendance?.length || 0;
  const present = initialAttendance?.filter((r: any) => r.status === 'present').length || 0;
  const absent = total - present;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Daily Attendance</h1>
          <p className="text-xs text-muted-foreground">Monitor daily member checks, first-in/last-out schedules, and biometric synchronizations.</p>
        </div>
        <button
          onClick={() => setGuideOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white text-foreground py-2.5 px-4 text-xs font-bold hover:bg-muted/40 cursor-pointer shadow-sm shrink-0"
        >
          <Cpu className="h-4.5 w-4.5 text-primary" />
          Setup Biometric Bridge
        </button>
      </div>

      {/* Date Picker & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Select Attendance Date</label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border bg-background py-2 pl-10 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-muted text-foreground"><Users className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Members</div>
            <div className="text-xl font-bold text-foreground mt-0.5">{total}</div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/15 text-success"><UserCheck className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-success uppercase">Present</div>
            <div className="text-xl font-bold text-success mt-0.5">{present}</div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><UserX className="h-6 w-6" /></div>
          <div>
            <div className="text-[10px] font-bold text-destructive uppercase">Absent</div>
            <div className="text-xl font-bold text-destructive mt-0.5">{absent}</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {!initialAttendance || initialAttendance.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
          <h3 className="text-md font-bold text-foreground">No records found</h3>
          <p className="text-xs text-muted-foreground mt-1">Please register members and setup a biometric device first.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Member Name</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Biometric UID</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">First In</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Out</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Punches</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {initialAttendance.map((r: any) => (
                  <tr key={r.memberId} className="border-b hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{r.memberName}</td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">{r.biometricUid || 'Not Set'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{r.firstIn || '-'}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{r.lastOut || '-'}</td>
                    <td className="px-6 py-4 font-bold text-muted-foreground">{r.totalPunches}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'present' 
                          ? 'bg-success/15 text-success' 
                          : 'bg-destructive/15 text-destructive'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BIOMETRIC BRIDGE GUIDE SHEET */}
      {guideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-white border-l shadow-2xl p-6 animate-fade-in flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary animate-pulse-glow" />
                  <h3 className="text-md font-extrabold text-foreground">Biometric Bridge setup Guide</h3>
                </div>
                <button onClick={() => setGuideOpen(false)} className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-foreground font-medium leading-relaxed">
                <p>
                  To sync punches from an on-premises <strong>ZKTeco or eSSL biometric device</strong> to this web app, install our lightweight local bridge script on any machine connected to the same local area network (LAN) as the biometric device.
                </p>

                <div className="bg-warning/10 border border-warning/20 p-3 rounded-xl flex gap-3 text-warning">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <strong className="block mb-0.5">Local Port Note</strong>
                    Ensure port <strong>4370</strong> (TCP) is open on the biometric device's IP and accessible on your local network.
                  </div>
                </div>

                <h4 className="text-sm font-bold text-foreground border-b pb-1 mt-6">Step 1: Install Node.js</h4>
                <p>
                  Make sure Node.js (version 18 or above) is installed on the computer running the bridge.
                </p>

                <h4 className="text-sm font-bold text-foreground border-b pb-1 mt-6">Step 2: Create project files</h4>
                <p>Create a directory `fittrack-essl-bridge` and install dependencies:</p>
                <pre className="bg-muted p-3 rounded-xl overflow-x-auto text-[10px] font-mono text-foreground font-bold">
                  mkdir fittrack-essl-bridge{"\n"}
                  cd fittrack-essl-bridge{"\n"}
                  npm init -y{"\n"}
                  npm install zklib-community dotenv axios
                </pre>

                <h4 className="text-sm font-bold text-foreground border-b pb-1 mt-6">Step 3: Setup Configuration</h4>
                <p>Create a `.env` file in the project folder with your credentials:</p>
                <pre className="bg-muted p-3 rounded-xl overflow-x-auto text-[10px] font-mono text-foreground font-bold">
                  DEVICE_IP=192.168.1.201       # Biometric machine local IP{"\n"}
                  DEVICE_PORT=4370              # Default ZK port{"\n"}
                  DEVICE_SERIAL=ZK123456789     # Biometric serial number{"\n"}
                  WEBHOOK_URL=http://localhost:8081/api/v1/attendance/punches{"\n"}
                  WEBHOOK_SECRET=404E635266556A586E3272357538782... # Your JWT secret from backend{"\n"}
                  SYNC_INTERVAL_SEC=30          # Pull logs every 30s
                </pre>

                <h4 className="text-sm font-bold text-foreground border-b pb-1 mt-6">Step 4: Bridge Script</h4>
                <p>Create a file named `index.js` and paste the sync loop logic:</p>
                <pre className="bg-muted p-3 rounded-xl overflow-x-auto text-[9px] font-mono text-foreground font-bold max-h-56 overflow-y-auto">
                  {`const ZKLib = require('zklib-community');
const axios = require('axios');
require('dotenv').config();

const config = {
  ip: process.env.DEVICE_IP,
  port: parseInt(process.env.DEVICE_PORT || '4370'),
  serial: process.env.DEVICE_SERIAL,
  url: process.env.WEBHOOK_URL,
  secret: process.env.WEBHOOK_SECRET,
  interval: parseInt(process.env.SYNC_INTERVAL_SEC || '30') * 1000
};

async function syncLogs() {
  const zk = new ZKLib(config.ip, config.port, 10000, 4000);
  try {
    console.log(\`Connecting to biometric reader at \${config.ip}...\`);
    await zk.createSocket();
    
    console.log('Retrieving punch logs...');
    const logs = await zk.getAttendance();
    
    if (logs && logs.data.length > 0) {
      console.log(\`Found \${logs.data.length} punches. Posting to web server...\`);
      
      const payload = logs.data.map(log => ({
        biometricUid: String(log.deviceUserId),
        punchTime: new Date(log.recordTime).toISOString(),
        punchType: log.eventType === 0 ? 'in' : log.eventType === 1 ? 'out' : 'unknown',
        deviceSerial: config.serial
      }));

      const res = await axios.post(config.url, payload, {
        headers: { 
          'Content-Type': 'application/json',
          'X-Webhook-Secret': config.secret 
        }
      });
      console.log(\`Sync complete! Server accepted: \${res.data.accepted}, deduped: \${res.data.deduped}\`);
    } else {
      console.log('No new logs on biometric reader.');
    }
  } catch (err) {
    console.error('Error during biometric logs sync:', err.message);
  } finally {
    try { await zk.disconnect(); } catch(e) {}
  }
}

console.log('FitTrack eSSL Sync Bridge Initialized.');
setInterval(syncLogs, config.interval);
syncLogs();`}
                </pre>
              </div>
            </div>

            <div className="flex gap-3 justify-end border-t pt-4 mt-6">
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 cursor-pointer shadow-sm"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
