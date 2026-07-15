'use server';

import { revalidatePath } from 'next/cache';
import { serverApiClient } from '@/lib/api/server-client';

// 1. Gym Profile & Setup Actions
export async function setupGymAction(data: { gymName: string; ownerName: string; mobile: string }) {
  const result = await serverApiClient('/gym/setup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return result;
}

export async function updateGymProfileAction(data: any) {
  const result = await serverApiClient('/gym', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return result;
}

// 2. Member Actions
export async function registerMemberAction(data: any) {
  const result = await serverApiClient('/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/members');
  revalidatePath('/dashboard');
  return result;
}

export async function editMemberAction(id: string, data: any) {
  const result = await serverApiClient(`/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
  return result;
}

export async function overrideMemberAccessAction(id: string, data: any) {
  const result = await serverApiClient(`/members/${id}/access`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
  revalidatePath('/dashboard');
  return result;
}

// 3. Membership & Payment Actions
export async function assignMembershipAction(id: string, data: any) {
  const result = await serverApiClient(`/members/${id}/memberships`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath(`/members/${id}`);
  revalidatePath('/members');
  revalidatePath('/dashboard');
  return result;
}

export async function addSubsequentPaymentAction(membershipId: number, data: any) {
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
}

// 4. Plan Actions
export async function createPlanAction(data: any) {
  const result = await serverApiClient('/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/plans');
  revalidatePath('/dashboard');
  return result;
}

export async function updatePlanAction(id: number, data: any) {
  const result = await serverApiClient(`/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  revalidatePath('/plans');
  revalidatePath('/dashboard');
  return result;
}

// 5. Device Actions
export async function createDeviceAction(data: any) {
  const result = await serverApiClient('/devices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/settings');
  return result;
}

export async function updateDeviceAction(id: number, data: any) {
  const result = await serverApiClient(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  revalidatePath('/settings');
  return result;
}

export async function deleteDeviceAction(id: number) {
  const result = await serverApiClient(`/devices/${id}`, {
    method: 'DELETE',
  });
  revalidatePath('/settings');
  return result;
}

// 6. Notification Actions
export async function logNotificationAction(data: any) {
  const result = await serverApiClient('/notifications/log', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/alerts');
  return result;
}
