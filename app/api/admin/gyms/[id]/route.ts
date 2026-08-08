import { NextResponse } from 'next/server';
import { getGymById } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const gymId = resolvedParams.id;

    const gym = await getGymById(gymId);

    if (!gym) {
      return NextResponse.json(
        { status: 440, message: 'Gym not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: 'Gym details fetched successfully',
      data: gym,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Failed to fetch gym details' },
      { status: 500 }
    );
  }
}
