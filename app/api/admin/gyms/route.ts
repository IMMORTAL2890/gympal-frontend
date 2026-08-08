import { NextResponse } from 'next/server';
import { getGyms } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const plan = searchParams.get('plan') || 'ALL';

    const gyms = await getGyms(search, plan);

    return NextResponse.json({
      status: 200,
      message: 'Gyms fetched successfully',
      data: gyms,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Failed to fetch gyms' },
      { status: 500 }
    );
  }
}
