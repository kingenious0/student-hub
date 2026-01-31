/**
 * Authentication Utilities
 * - Secure token handling
 * - Password hashing
 * - Session management
 * - Role-based access control
 */

import { jwtVerify, SignJWT } from 'jose';
import { env } from './env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Create a signed JWT token
 */
export async function createToken(
  payload: Record<string, any>,
  expiresIn: string = '7d'
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<Record<string, any> | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as Record<string, any>;
  } catch (error) {
    return null;
  }
}

/**
 * Role-based permission checker
 */
export type UserRole = 'STUDENT' | 'VENDOR' | 'ADMIN' | 'GOD_MODE';

export const rolePermissions: Record<UserRole, string[]> = {
  STUDENT: [
    'view:products',
    'create:orders',
    'view:own-orders',
    'edit:profile',
    'create:reviews',
  ],
  VENDOR: [
    'create:products',
    'edit:own-products',
    'view:own-orders',
    'fulfill:orders',
    'view:analytics',
    'create:stories',
    'request:payout',
  ],
  ADMIN: [
    'manage:users',
    'manage:products',
    'manage:orders',
    'manage:vendors',
    'view:analytics',
    'manage:settings',
  ],
  GOD_MODE: [
    '*', // Full access
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes('*') || permissions.includes(permission);
}

export function checkRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    STUDENT: 0,
    VENDOR: 1,
    ADMIN: 2,
    GOD_MODE: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Generate a secure random code (for OTP, verification codes, etc.)
 */
export function generateSecureCode(length: number = 6): string {
  const chars = '0123456789';
  let code = '';
  const array = new Uint8Array(length);
  
  if (typeof window === 'undefined') {
    // Node.js
    const crypto = require('crypto');
    crypto.getRandomValues(array);
  } else {
    // Browser
    crypto.getRandomValues(array);
  }

  for (let i = 0; i < length; i++) {
    code += chars[array[i] % chars.length];
  }

  return code;
}

/**
 * Verify a user has permission for an action
 * Used in API routes and middleware
 */
export interface AuthContext {
  userId: string;
  role: UserRole;
  email: string;
}

export function requireRole(context: AuthContext, requiredRole: UserRole): boolean {
  return checkRole(context.role, requiredRole);
}

export function requirePermission(context: AuthContext, permission: string): boolean {
  return hasPermission(context.role, permission);
}
