// Supabase Cloud PostgreSQL helper for FitTrack Ops Console

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('http') && (supabaseServiceKey || supabaseAnonKey)
);

// Standard Feature Keys supported by FitTrack
export const FEATURE_KEYS = [
  { key: 'MEMBER_MANAGEMENT', label: 'Member Management', description: 'Members & Membership Plans' },
  { key: 'ATTENDANCE_CHECKIN', label: 'Attendance Check-in', description: 'Manual & QR Check-ins' },
  { key: 'ONLINE_PAYMENTS', label: 'Online Payments', description: 'Payment Receipts & Revenue Reports' },
  { key: 'SMS_WHATSAPP_NOTIFICATIONS', label: 'SMS & WhatsApp Notifications', description: 'Expiry Alerts & WhatsApp Reminders' },
  { key: 'MACHINE_INTEGRATION', label: 'Machine Integration', description: 'Biometric LAN Readers & ADMS Push Direct Sync' },
] as const;

export type FeatureKey = typeof FEATURE_KEYS[number]['key'];

export interface GymOwnerRecord {
  id: string;
  gymId?: string;
  auth_user_id: string;
  gym_name: string;
  gymName?: string;
  owner_name: string;
  ownerName?: string;
  mobile_number: string;
  mobileNumber?: string;
  subscription_plan: 'FREE' | 'BASIC' | 'PREMIUM';
  subscriptionPlan?: 'FREE' | 'BASIC' | 'PREMIUM';
  status: 'active' | 'suspended';
  active_devices_count?: number;
  memberCount?: number;
  allTimeRevenue?: number;
  created_at?: string;
}

export interface GymFeatureRecord {
  gym_id: string;
  feature_key: FeatureKey | string;
  enabled: boolean;
  updated_by?: string;
  updated_at?: string;
}

export interface FeatureAuditLogRecord {
  id: string;
  admin_id?: string;
  gym_id: string;
  gym_name?: string;
  feature_key: string;
  old_value?: boolean;
  new_value: boolean;
  timestamp: string;
  updated_by?: string;
}

// Fallback in-memory dataset
const mockGyms: GymOwnerRecord[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    gymId: 'c1111111-1111-1111-1111-111111111111',
    auth_user_id: 'u1111111-1111-1111-1111-111111111111',
    gym_name: 'Apex Fitness Club',
    gymName: 'Apex Fitness Club',
    owner_name: 'John Wick',
    ownerName: 'John Wick',
    mobile_number: '+1 555-0192',
    mobileNumber: '+1 555-0192',
    subscription_plan: 'PREMIUM',
    subscriptionPlan: 'PREMIUM',
    status: 'active',
    active_devices_count: 3,
    memberCount: 245,
    allTimeRevenue: 480000,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    gymId: 'c2222222-2222-2222-2222-222222222222',
    auth_user_id: 'u2222222-2222-2222-2222-222222222222',
    gym_name: 'Iron Gym & Crossfit',
    gymName: 'Iron Gym & Crossfit',
    owner_name: 'Sarah Connor',
    ownerName: 'Sarah Connor',
    mobile_number: '+1 555-0144',
    mobileNumber: '+1 555-0144',
    subscription_plan: 'BASIC',
    subscriptionPlan: 'BASIC',
    status: 'active',
    active_devices_count: 2,
    memberCount: 120,
    allTimeRevenue: 260000,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    gymId: 'c3333333-3333-3333-3333-333333333333',
    auth_user_id: 'u3333333-3333-3333-3333-333333333333',
    gym_name: 'Pulse Fitness Studio',
    gymName: 'Pulse Fitness Studio',
    owner_name: 'Bruce Wayne',
    ownerName: 'Bruce Wayne',
    mobile_number: '+1 555-0188',
    mobileNumber: '+1 555-0188',
    subscription_plan: 'FREE',
    subscriptionPlan: 'FREE',
    status: 'active',
    active_devices_count: 1,
    memberCount: 45,
    allTimeRevenue: 95000,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    gymId: 'c4444444-4444-4444-4444-444444444444',
    auth_user_id: 'u4444444-4444-4444-4444-444444444444',
    gym_name: 'Titan Health & Power',
    gymName: 'Titan Health & Power',
    owner_name: 'Diana Prince',
    ownerName: 'Diana Prince',
    mobile_number: '+1 555-0177',
    mobileNumber: '+1 555-0177',
    subscription_plan: 'PREMIUM',
    subscriptionPlan: 'PREMIUM',
    status: 'suspended',
    active_devices_count: 0,
    memberCount: 310,
    allTimeRevenue: 590000,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const mockFeatures: Record<string, Record<string, boolean>> = {
  'c1111111-1111-1111-1111-111111111111': {
    MEMBER_MANAGEMENT: true,
    ATTENDANCE_CHECKIN: true,
    ONLINE_PAYMENTS: true,
    SMS_WHATSAPP_NOTIFICATIONS: true,
    MACHINE_INTEGRATION: true,
  },
  'c2222222-2222-2222-2222-222222222222': {
    MEMBER_MANAGEMENT: true,
    ATTENDANCE_CHECKIN: true,
    ONLINE_PAYMENTS: false,
    SMS_WHATSAPP_NOTIFICATIONS: true,
    MACHINE_INTEGRATION: false,
  },
  'c3333333-3333-3333-3333-333333333333': {
    MEMBER_MANAGEMENT: true,
    ATTENDANCE_CHECKIN: true,
    ONLINE_PAYMENTS: false,
    SMS_WHATSAPP_NOTIFICATIONS: false,
    MACHINE_INTEGRATION: false,
  },
  'c4444444-4444-4444-4444-444444444444': {
    MEMBER_MANAGEMENT: true,
    ATTENDANCE_CHECKIN: true,
    ONLINE_PAYMENTS: true,
    SMS_WHATSAPP_NOTIFICATIONS: true,
    MACHINE_INTEGRATION: true,
  },
};

const mockAuditLogs: FeatureAuditLogRecord[] = [
  {
    id: 'log-1',
    admin_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    gym_id: 'c2222222-2222-2222-2222-222222222222',
    gym_name: 'Iron Gym & Crossfit',
    feature_key: 'ONLINE_PAYMENTS',
    old_value: true,
    new_value: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    updated_by: 'Super Admin',
  },
  {
    id: 'log-2',
    admin_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    gym_id: 'c2222222-2222-2222-2222-222222222222',
    gym_name: 'Iron Gym & Crossfit',
    feature_key: 'MACHINE_INTEGRATION',
    old_value: true,
    new_value: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    updated_by: 'Super Admin',
  },
];

// Helper for HTTP fetch calls to Supabase REST API
async function supabaseFetch(table: string, method: string = 'GET', body?: any, params?: string) {
  const apiKey = supabaseServiceKey || supabaseAnonKey;
  let url = `${supabaseUrl}/rest/v1/${table}`;
  if (params) url += `?${params}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase request failed: ${res.status} ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getGyms(search?: string, plan?: string) {
  if (isSupabaseConfigured) {
    try {
      let queryParams = 'select=*';
      if (plan && plan !== 'ALL') {
        queryParams += `&subscription_plan=eq.${plan}`;
      }
      const data = await supabaseFetch('gym_owner', 'GET', undefined, queryParams);
      if (data && Array.isArray(data)) {
        let filtered = data.map((g: any) => ({
          ...g,
          gymId: g.id,
          gymName: g.gym_name,
          ownerName: g.owner_name,
          mobileNumber: g.mobile_number,
          subscriptionPlan: g.subscription_plan,
        }));
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (g) =>
              g.gym_name.toLowerCase().includes(q) ||
              g.owner_name.toLowerCase().includes(q) ||
              g.mobile_number.toLowerCase().includes(q)
          );
        }
        return filtered;
      }
    } catch (e) {
      console.warn('Supabase fetch error, using fallback data store', e);
    }
  }

  let list = mockGyms;
  if (plan && plan !== 'ALL') {
    list = list.filter((g) => g.subscription_plan === plan || g.subscriptionPlan === plan);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (g) =>
        g.gym_name.toLowerCase().includes(q) ||
        g.owner_name.toLowerCase().includes(q) ||
        g.mobile_number.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function getGymById(gymId: string) {
  if (isSupabaseConfigured) {
    try {
      const gymData = await supabaseFetch('gym_owner', 'GET', undefined, `id=eq.${gymId}`);
      const gym = gymData && gymData[0];
      const featuresData = await supabaseFetch('gym_features', 'GET', undefined, `gym_id=eq.${gymId}`);
      if (gym) {
        const featureMap: Record<string, boolean> = {};
        FEATURE_KEYS.forEach((f) => {
          featureMap[f.key] = true;
        });
        if (featuresData && Array.isArray(featuresData)) {
          featuresData.forEach((f: any) => {
            featureMap[f.feature_key] = f.enabled;
          });
        }
        return {
          ...gym,
          gymId: gym.id,
          gymName: gym.gym_name,
          ownerName: gym.owner_name,
          mobileNumber: gym.mobile_number,
          subscriptionPlan: gym.subscription_plan,
          features: featureMap,
        };
      }
    } catch (e) {
      console.warn('Supabase fetch single gym error, using fallback', e);
    }
  }

  const gym = mockGyms.find((g) => g.id === gymId || g.gymId === gymId);
  if (!gym) return null;
  const features = mockFeatures[gym.id] || {
    MEMBER_MANAGEMENT: true,
    ATTENDANCE_CHECKIN: true,
    ONLINE_PAYMENTS: true,
    SMS_WHATSAPP_NOTIFICATIONS: true,
    MACHINE_INTEGRATION: true,
  };
  return {
    ...gym,
    gymId: gym.id,
    gymName: gym.gym_name,
    ownerName: gym.owner_name,
    mobileNumber: gym.mobile_number,
    subscriptionPlan: gym.subscription_plan,
    features,
  };
}

export async function updateGymPlan(gymId: string, subscriptionPlan: 'FREE' | 'BASIC' | 'PREMIUM') {
  if (isSupabaseConfigured) {
    try {
      await supabaseFetch('gym_owner', 'PATCH', { subscription_plan: subscriptionPlan }, `id=eq.${gymId}`);
    } catch (e) {
      console.warn('Supabase update plan error', e);
    }
  }

  const gym = mockGyms.find((g) => g.id === gymId || g.gymId === gymId);
  if (gym) {
    gym.subscription_plan = subscriptionPlan;
    gym.subscriptionPlan = subscriptionPlan;
  }
  return { success: true, gymId, subscriptionPlan };
}

export async function updateGymStatus(gymId: string, status: 'active' | 'suspended') {
  if (isSupabaseConfigured) {
    try {
      await supabaseFetch('gym_owner', 'PATCH', { status }, `id=eq.${gymId}`);
    } catch (e) {
      console.warn('Supabase update status error', e);
    }
  }

  const gym = mockGyms.find((g) => g.id === gymId || g.gymId === gymId);
  if (gym) {
    gym.status = status;
  }
  return { success: true, gymId, status };
}

export async function upsertGymFeature(
  gymId: string,
  featureKey: string,
  enabled: boolean,
  updatedBy: string = 'Super Admin'
) {
  let oldValue = true;

  if (isSupabaseConfigured) {
    try {
      const existing = await supabaseFetch('gym_features', 'GET', undefined, `gym_id=eq.${gymId}&feature_key=eq.${featureKey}`);
      if (existing && existing[0]) oldValue = existing[0].enabled;

      await supabaseFetch('gym_features', 'POST', {
        gym_id: gymId,
        feature_key: featureKey,
        enabled,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      });

      await supabaseFetch('feature_audit_logs', 'POST', {
        gym_id: gymId,
        feature_key: featureKey,
        old_value: oldValue,
        new_value: enabled,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase upsert feature error', e);
    }
  }

  if (!mockFeatures[gymId]) {
    mockFeatures[gymId] = {
      MEMBER_MANAGEMENT: true,
      ATTENDANCE_CHECKIN: true,
      ONLINE_PAYMENTS: true,
      SMS_WHATSAPP_NOTIFICATIONS: true,
      MACHINE_INTEGRATION: true,
    };
  }
  oldValue = mockFeatures[gymId][featureKey] ?? true;
  mockFeatures[gymId][featureKey] = enabled;

  const gym = mockGyms.find((g) => g.id === gymId || g.gymId === gymId);
  mockAuditLogs.unshift({
    id: `log-${Date.now()}`,
    gym_id: gymId,
    gym_name: gym?.gym_name || gym?.gymName || 'Gym ' + gymId.slice(0, 6),
    feature_key: featureKey,
    old_value: oldValue,
    new_value: enabled,
    timestamp: new Date().toISOString(),
    updated_by: updatedBy,
  });

  return { success: true, gymId, featureKey, enabled, oldValue };
}

export async function getAuditLogs() {
  if (isSupabaseConfigured) {
    try {
      const data = await supabaseFetch('feature_audit_logs', 'GET', undefined, 'order=timestamp.desc');
      if (data && Array.isArray(data)) {
        return data.map((log: any) => ({
          id: log.id,
          admin_id: log.admin_id,
          gym_id: log.gym_id,
          gym_name: 'Gym ' + log.gym_id.slice(0, 6),
          feature_key: log.feature_key,
          old_value: log.old_value,
          new_value: log.new_value,
          timestamp: log.timestamp,
          updated_by: log.updated_by || 'Super Admin',
        }));
      }
    } catch (e) {
      console.warn('Supabase fetch audit logs error', e);
    }
  }

  return mockAuditLogs;
}
