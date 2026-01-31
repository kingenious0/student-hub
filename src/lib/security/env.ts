/**
 * Environment Variables Management
 * - Server-only (never expose to client)
 * - Validates required vars at startup
 * - Centralizes all config
 */

// Only validate on server-side imports
if (typeof window !== 'undefined') {
  throw new Error('env.ts should only be imported on the server side');
}

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Authentication (Clerk)
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,

  // Payments (Paystack) - NEVER expose secret
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
  PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,

  // Email (Brevo)
  BREVO_API_KEY: process.env.BREVO_API_KEY!,

  // SMS (Wigal)
  WIGAL_API_KEY: process.env.WIGAL_API_KEY,
  WIGAL_USERNAME: process.env.WIGAL_USERNAME,

  // Location Services (Radar)
  RADAR_SECRET_KEY: process.env.RADAR_SECRET_KEY,
  RADAR_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY,

  // Media Upload (Cloudinary)
  CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

  // App Config
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
} as const;

/**
 * Validate critical environment variables
 */
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'CLERK_PUBLISHABLE_KEY',
    'PAYSTACK_SECRET_KEY',
    'BREVO_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate on module load in production
if (env.NODE_ENV === 'production') {
  validateEnv();
}
