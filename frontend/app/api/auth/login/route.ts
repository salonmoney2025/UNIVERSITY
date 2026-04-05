import { NextRequest, NextResponse } from 'next/server';

// Determine backend URL based on environment
const getBackendUrl = () => {
  // In Docker, use service name; otherwise use localhost
  const isDocker = process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'production';
  return isDocker ? 'http://backend:8000' : 'http://localhost:5000';
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call Django backend API directly
    const backendUrl = getBackendUrl();
    console.log('[Login] Calling Django backend at:', backendUrl);

    const djangoResponse = await fetch(`${backendUrl}/api/v1/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseText = await djangoResponse.text();
    console.log('[Login] Django response status:', djangoResponse.status);
    console.log('[Login] Django response:', responseText.substring(0, 200));

    let djangoData;
    try {
      djangoData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Login] Failed to parse Django response as JSON:', responseText);
      return NextResponse.json(
        { error: 'Backend server error. Please check if Django is running.' },
        { status: 503 }
      );
    }

    if (!djangoResponse.ok) {
      return NextResponse.json(
        { error: djangoData.error || djangoData.detail || 'Invalid credentials' },
        { status: djangoResponse.status }
      );
    }

    // Extract tokens and user data from Django response
    const tokens = djangoData.tokens || djangoData.access;
    const user = djangoData.user || {};

    // Create response with user data and tokens
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || email,
        name: user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : user.email,
        role: user.role || 'STUDENT',
        studentId: user.student_id,
        staffId: user.staff_id,
        department: user.department,
      },
      token: tokens?.access || tokens,
      djangoTokens: tokens, // Include Django tokens for API calls
    });

    // Set auth cookie
    if (tokens?.access) {
      response.cookies.set('auth-token', tokens.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    console.log('[Login] Login successful for:', email);
    return response;

  } catch (error) {
    console.error('[Login] Error:', error);

    // Provide more detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to connect to backend server',
        details: errorMessage,
        hint: 'Make sure Django backend is running on port 5000'
      },
      { status: 500 }
    );
  }
}
