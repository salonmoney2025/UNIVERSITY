import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcrypt';

// Mock database - in production, this would connect to your actual database
const userPasswords = new Map();
const passwordHistory = new Map();

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check password requirements
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    const passwordStrength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (passwordStrength < 3) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password is too weak. It must contain uppercase, lowercase, numbers, and special characters.'
        },
        { status: 400 }
      );
    }

    // Get current password hash from database (mock)
    let currentPasswordHash = userPasswords.get(user.userId);

    // If no password exists (first time), use a default hash for demo
    if (!currentPasswordHash) {
      // In production, this should never happen - all users should have passwords
      currentPasswordHash = await bcrypt.hash('admin123', 10); // default password for demo
      userPasswords.set(user.userId, currentPasswordHash);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, currentPasswordHash);

    if (isSamePassword) {
      return NextResponse.json(
        { success: false, message: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Check password history (prevent reuse of last 3 passwords)
    const history = passwordHistory.get(user.userId) || [];
    for (const oldHash of history) {
      const isReused = await bcrypt.compare(newPassword, oldHash);
      if (isReused) {
        return NextResponse.json(
          {
            success: false,
            message: 'You cannot reuse one of your last 3 passwords'
          },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password in database (mock)
    userPasswords.set(user.userId, newPasswordHash);

    // Update password history
    history.unshift(currentPasswordHash);
    if (history.length > 3) {
      history.pop();
    }
    passwordHistory.set(user.userId, history);

    console.log('Password changed successfully for user:', user.userId);

    // In production, you might want to:
    // 1. Send email notification about password change
    // 2. Log the password change event
    // 3. Invalidate other sessions (optional)
    // 4. Update last_password_change timestamp

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}
