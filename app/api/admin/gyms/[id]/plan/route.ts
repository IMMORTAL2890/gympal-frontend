import { NextResponse } from 'next/server';
import { updateGymPlan } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const gymId = resolvedParams.id;
    const body = await request.json();
    const { plan, subscription_plan } = body;
    const newPlan = (subscription_plan || plan || '').toUpperCase();

    if (!['FREE', 'BASIC', 'PREMIUM'].includes(newPlan)) {
      return NextResponse.json(
        { status: 400, message: 'Invalid subscription plan. Must be FREE, BASIC, or PREMIUM.' },
        { status: 400 }
      );
    }

    const result = await updateGymPlan(gymId, newPlan as 'FREE' | 'BASIC' | 'PREMIUM');

    return NextResponse.json({
      status: 200,
      message: `Subscription plan updated to ${newPlan}`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}
