'use server';

import { revalidatePath } from 'next/cache';
import { serverApiClient } from '@/lib/api/server-client';

const handleActionError = (error: any) => {
  throw new Error(error.message || 'Action failed');
};

// 1. Gym Profile & Setup Actions
export async function setupGymAction(data: { gymName: string; ownerName: string; mobile: string }) {
  try {
    const result = await serverApiClient('/gym/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

export async function updateGymProfileAction(data: any) {
  try {
    const result = await serverApiClient('/gym', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

// 2. Member Actions
export async function registerMemberAction(data: any) {
  try {
    const result = await serverApiClient('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/members');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

export async function editMemberAction(id: string, data: any) {
  try {
    const result = await serverApiClient(`/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath(`/members/${id}`);
    revalidatePath('/members');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

export async function overrideMemberAccessAction(id: string, data: any) {
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
    handleActionError(error);
  }
}

// 3. Membership & Payment Actions
export async function assignMembershipAction(id: string, data: any) {
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
    handleActionError(error);
  }
}

export async function addSubsequentPaymentAction(membershipId: number, data: any) {
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
    handleActionError(error);
  }
}

// 4. Plan Actions
export async function createPlanAction(data: any) {
  try {
    const result = await serverApiClient('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/plans');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

export async function updatePlanAction(id: number, data: any) {
  try {
    const result = await serverApiClient(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/plans');
    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

// 5. Device Actions
export async function createDeviceAction(data: any) {
  try {
    const result = await serverApiClient('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/settings');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

export async function updateDeviceAction(id: number, data: any) {
  try {
    const result = await serverApiClient(`/devices/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    revalidatePath('/settings');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

export async function deleteDeviceAction(id: number) {
  try {
    const result = await serverApiClient(`/devices/${id}`, {
      method: 'DELETE',
    });
    revalidatePath('/settings');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}

// 6. Notification Actions
export async function logNotificationAction(data: any) {
  try {
    const result = await serverApiClient('/notifications/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    revalidatePath('/alerts');
    return result;
  } catch (error) {
    handleActionError(error);
  }
}
