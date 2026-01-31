/**
 * Command Center Authentication API
 * SECURITY: Uses role-based access control, not password-based
 * Only ADMIN and GOD_MODE users can access command center
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { errorResponse, successResponse } from '@/lib/security/api-response';
import { prisma } from '@/lib/db/prisma';

/**
 * Verify user is admin/god_mode - replaces hardcoded password
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        errorResponse('Not authenticated', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { email: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'GOD_MODE';

    if (!isAdmin) {
      console.warn(`[SECURITY] Unauthorized command center access attempt by ${userId}`);
      return NextResponse.json(
        errorResponse('Access denied. Admin only.', 'FORBIDDEN'),
        { status: 403 }
      );
    }

    // Log successful access
    console.log(`[ADMIN] ${user.email} accessed command center`);

    return NextResponse.json(
      successResponse({
        authorized: true,
        role: user.role,
        email: user.email,
      })
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      errorResponse('Authentication failed', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
