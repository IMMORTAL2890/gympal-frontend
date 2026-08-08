import { NextResponse } from 'next/server';
import { getAuditLogs } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const logs = await getAuditLogs();

    return NextResponse.json({
      status: 200,
      message: 'Audit logs fetched successfully',
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
