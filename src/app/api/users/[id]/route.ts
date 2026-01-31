/**
 * User Profile API
 * GET /api/users/:id - Get user profile
 * PATCH /api/users/:id - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validateData, userProfileSchema } from '@/lib/security/validation';
import { errorResponse, successResponse } from '@/lib/security/api-response';
import { sanitizeInput } from '@/lib/security/validation';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        errorResponse('Not authenticated', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: params.id },
          { id: params.id },
        ],
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        phoneNumber: true,
        university: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse(user));
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch user', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        errorResponse('Not authenticated', 'UNAUTHORIZED'),
        { status: 401 }
      );
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: params.id },
          { id: params.id },
        ],
      },
      select: {
        id: true,
        clerkId: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        errorResponse('User not found', 'USER_NOT_FOUND'),
        { status: 404 }
      );
    }

    if (userId !== targetUser.clerkId) {
      const requester = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      });

      const isAdmin = requester?.role === 'ADMIN' || requester?.role === 'GOD_MODE';
      if (!isAdmin) {
        return NextResponse.json(
          errorResponse('Cannot update other users', 'FORBIDDEN'),
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    // Validate input
    const validation = validateData(userProfileSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        errorResponse(validation.error || 'Invalid input', 'VALIDATION_ERROR'),
        { status: 400 }
      );
    }

    const sanitized = {
      ...validation.data,
      name: validation.data?.name ? sanitizeInput(validation.data.name) : undefined,
      phoneNumber: validation.data?.phoneNumber ? sanitizeInput(validation.data.phoneNumber) : undefined,
    };

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: sanitized,
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        phoneNumber: true,
        university: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(successResponse(updated));
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      errorResponse('Failed to update user', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}
