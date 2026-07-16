'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerMemberAction } from '@/app/actions';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Save, Loader2, Key } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';

export default function AddMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [joinedDate, setJoinedDate] = useState(new Date().toISOString().split('T')[0]);
  const [biometricUid, setBiometricUid] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobileNumber) {
      toast.error('Name and mobile number are required');
      return;
    }
    if (!mobileNumber.match(/^[0-9]{10}$/)) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }

    const payload = {
      fullName,
      mobileNumber,
      email: email || null,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      photoUrl: photoUrl || null,
      joinedDate,
      biometricUid: biometricUid || null,
    };

    setLoading(true);
    try {
      const data = await registerMemberAction(payload);
      toast.success('Member added successfully!');
      router.replace(`/members/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <button
          onClick={() => router.push('/members')}
          className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Back to list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Member</h1>
          <p className="text-xs text-muted-foreground">Register a new gym member and configure biometric details.</p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Full Name *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="text"
                required
                placeholder="Rohan Malhotra"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="email"
                placeholder="rohan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Date of Birth (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Joined Date */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Joined Date *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="date"
                required
                value={joinedDate}
                onChange={(e) => setJoinedDate(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Home Address (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Flat 304, Green Heights, Delhi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Biometric UID */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Biometric Device UID (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Key className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="1004"
                value={biometricUid}
                onChange={(e) => setBiometricUid(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              Profile Photo URL (Optional)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4.5 w-4.5 text-muted-foreground" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end border-t pt-5">
          <button
            type="button"
            onClick={() => router.push('/members')}
            className="px-4 py-2.5 rounded-xl border text-sm font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary py-2.5 px-6 text-sm font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                Register Member
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
