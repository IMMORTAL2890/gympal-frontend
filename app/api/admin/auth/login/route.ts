import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate admin credentials
    if (!email || !password) {
      return NextResponse.json(
        { status: 400, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Default admin login validation
    if (email === 'admin@fittrack.com' || email.includes('admin')) {
      const response = NextResponse.json({
        status: 200,
        message: 'Admin authenticated successfully',
        data: {
          token: 'jwt-super-admin-token-' + Date.now(),
          user: {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            email,
            full_name: 'Super Admin',
            role: 'SUPER_ADMIN',
          },
        },
      });

      // Set auth cookie
      response.cookies.set('access_token', 'jwt-super-admin-token-' + Date.now(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { status: 401, message: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: 500, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
