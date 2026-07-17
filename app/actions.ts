'use server';

import { revalidatePath } from 'next/cache';
import { serverApiClient } from '@/lib/api/server-client';

// Server Actions MUST NOT throw errors to the client in Next.js —
// doing so causes a generic 500 Internal Server Error response.
// Instead we return { error: string } and the caller checks for it.
type ActionResult<T = any> = T | { error: string };

function extractMessage(err: any): string {
  if (typeof err === 'string') return err;
  
  // Extract detailed field-level validation errors if present in the envelope's data field
  if (err?.data && typeof err.data === 'object' && !Array.isArray(err.data)) {
    const fieldErrors = Object.entries(err.data)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(', ');
    if (fieldErrors) {
      return `${err.message || 'Validation failed'}: ${fieldErrors}`;
    }
  }

  if (err?.message) return err.message;
  if (err?.error) return err.error;
  return 'Action failed';
}

// 1. Gym Profile & Setup Actions
export async function setupGymAction(data: {
  gymName: string;
  ownerName: string;
  mobile: string;
}): Promise<ActionResult> {
  try {
    const result = await serverApiClient('/gym/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function updateGymProfileAction(data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient('/gym', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

// 2. Member Actions
export async function registerMemberAction(data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/members');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function editMemberAction(id: string, data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath(`/members/${id}`);
    revalidatePath('/members');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function overrideMemberAccessAction(id: string, data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/members/${id}/access`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath(`/members/${id}`);
    revalidatePath('/members');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

// 3. Membership & Payment Actions
export async function assignMembershipAction(id: string, data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/members/${id}/memberships`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath(`/members/${id}`);
    revalidatePath('/members');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function addSubsequentPaymentAction(
  membershipId: number,
  data: any
): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/memberships/${membershipId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const memberId = result.memberId || result.membership?.memberId;
    if (memberId) {
      revalidatePath(`/members/${memberId}`);
    }
    revalidatePath('/members');
    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

// 4. Plan Actions
export async function createPlanAction(data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/plans');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function updatePlanAction(id: number, data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/plans');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

// 5. Device Actions
export async function createDeviceAction(data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/settings');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function updateDeviceAction(id: number, data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/settings');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

export async function deleteDeviceAction(id: number): Promise<ActionResult> {
  try {
    const result = await serverApiClient(`/devices/${id}`, {
      method: 'DELETE',
    });
    revalidatePath('/settings');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}

// 6. Notification Actions
export async function logNotificationAction(data: any): Promise<ActionResult> {
  try {
    const result = await serverApiClient('/notifications/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/alerts');
    return result;
  } catch (error) {
    return { error: extractMessage(error) };
  }
}
