import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    // Log for debugging
    console.log('Auth check - Token present:', !!token);
    console.log('Auth check - All cookies:', request.cookies.getAll().map(c => c.name));

    if (!token) {
      console.log('Auth check - No token found, returning 401');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      console.log('Auth check - Invalid token, returning 401');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Auth check - Success for user:', user.email);
    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}
