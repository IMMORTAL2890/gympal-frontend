import { NextResponse } from 'next/server';
import { updateGymStatus } from '@/lib/supabase';

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
    const { status } = body;

    if (!['active', 'suspended'].includes(status)) {
      return NextResponse.json(
        { status: 400, message: 'Invalid status. Must be active or suspended.' },
        { status: 400 }
      );
    }

    const result = await updateGymStatus(gymId, status as 'active' | 'suspended');

    return NextResponse.json({
      status: 200,
      message: `Gym status updated to ${status}`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Failed to update gym status' },
      { status: 500 }
    );
  }
}
