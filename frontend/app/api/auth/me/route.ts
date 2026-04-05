import { NextRequest, NextResponse } from 'next/server';

// Determine backend URL based on environment
const getBackendUrl = () => {
  const isDocker = process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'production';
  return isDocker ? 'http://backend:8000' : 'http://localhost:5000';
};

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    console.log('[Auth Check] Token present:', !!token);

    if (!token) {
      console.log('[Auth Check] No token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call Django backend to validate token and get user info
    const backendUrl = getBackendUrl();
    console.log('[Auth Check] Calling Django backend at:', backendUrl);

    const djangoResponse = await fetch(`${backendUrl}/api/v1/auth/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!djangoResponse.ok) {
      console.log('[Auth Check] Django returned:', djangoResponse.status);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userData = await djangoResponse.json();
    console.log('[Auth Check] Success for user:', userData.email);

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.full_name || userData.email,
        role: userData.role,
        studentId: userData.student_id,
        staffId: userData.staff_id,
        department: userData.department,
      },
    });
  } catch (error) {
    console.error('[Auth Check] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication' },
      { status: 500 }
    );
  }
}
