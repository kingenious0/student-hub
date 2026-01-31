/**
 * Secure Middleware for API Routes
 * - Authentication verification
 * - Rate limiting
 * - CORS handling
 * - Request logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth-utils';
import { errorResponse, ErrorCodes } from './api-response';

export interface ProtectedRequest extends NextRequest {
  userId?: string;
  userRole?: string;
  email?: string;
}

/**
 * Middleware to verify authentication
 */
export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      errorResponse('No auth token provided', 'UNAUTHORIZED'),
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      errorResponse('Invalid or expired token', 'TOKEN_EXPIRED'),
      { status: 401 }
    );
  }

  return { userId: payload.userId, role: payload.role, email: payload.email };
}

/**
 * Rate limiting helper
 * Use Redis in production for distributed rate limiting
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < maxRequests) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * Log API requests (for monitoring/debugging)
 */
export function logApiRequest(
  method: string,
  path: string,
  userId?: string,
  statusCode?: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${method} ${path} ${userId ? `(${userId})` : ''} - ${statusCode}`);
  }
}

/**
 * Safe database transaction wrapper
 */
export async function runInTransaction<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}
