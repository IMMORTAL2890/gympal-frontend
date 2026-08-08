import { NextResponse } from 'next/server';
import { upsertGymFeature } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const gymId = resolvedParams.id;
    const body = await request.json();

    // Body can be { featureKey, enabled, updatedBy } or { feature_key, enabled }
    const featureKey = body.featureKey || body.feature_key;
    const enabled = Boolean(body.enabled);
    const updatedBy = body.updatedBy || body.updated_by || 'Super Admin';

    if (!featureKey) {
      return NextResponse.json(
        { status: 400, message: 'feature_key is required' },
        { status: 400 }
      );
    }

    const result = await upsertGymFeature(gymId, featureKey, enabled, updatedBy);

    return NextResponse.json({
      status: 200,
      message: `Feature ${featureKey} set to ${enabled ? 'enabled' : 'disabled'}`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Failed to update gym feature' },
      { status: 500 }
    );
  }
}
