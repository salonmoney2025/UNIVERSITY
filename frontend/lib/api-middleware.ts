import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, JWTPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to check if user is authenticated
 * Returns user object if authenticated, or error response if not
 */
export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const user = getCurrentUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to check if user has required role(s)
 * Returns user object if authorized, or error response if not
 */
export function requireRole(allowedRoles: string[], handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const user = getCurrentUser();

      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'You do not have permission to access this resource' },
          { status: 403 }
        );
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = user;

      return handler(authenticatedReq);
    } catch (error) {
      console.error('Authorization error:', error);
      return NextResponse.json(
        { error: 'Authorization failed' },
        { status: 403 }
      );
    }
  };
}

/**
 * Check if user has specific role
 */
export function hasRole(user: JWTPayload | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Get current authenticated user or return error response
 */
export function getAuthUser(): { user: JWTPayload; error: null } | { user: null; error: NextResponse } {
  const user = getCurrentUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Validate user has required role or return error response
 */
export function validateRole(user: JWTPayload, allowedRoles: string[]): { valid: true; error: null } | { valid: false; error: NextResponse } {
  if (!allowedRoles.includes(user.role)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'You do not have permission to access this resource' },
        { status: 403 }
      ),
    };
  }

  return { valid: true, error: null };
}
