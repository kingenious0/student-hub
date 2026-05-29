/**
 * Input Validation & Sanitization
 * - Type-safe validation using Zod
 * - Protection against XSS, injection attacks
 * - Consistent error messages
 */

import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

export const uuidSchema = z
  .string()
  .uuid('Invalid ID format');

// User schemas
export const userSignUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(50).trim(),
  university: z.string().optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password required'),
});

export const userProfileSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  phoneNumber: phoneSchema.optional(),
  university: z.string().max(100).optional(),
});

// Product schemas
export const productCreateSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  hotspot: z.string().max(100).optional(),
  stockQuantity: z.number().int().nonnegative().default(1),
  images: z.array(z.string().url()).default([]),
  details: z.record(z.unknown()).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

// Order schemas
export const orderCreateSchema = z.object({
  items: z.array(
    z.object({
      productId: uuidSchema,
      quantity: z.number().int().positive(),
    })
  ).min(1),
  fulfillmentType: z.enum(['PICKUP', 'DELIVERY']),
});

// Vendor application
export const vendorApplicationSchema = z.object({
  shopName: z.string().min(3).max(100).trim(),
  shopDesc: z.string().min(10).max(1000).trim(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
});

/**
 * Sanitize user input - remove dangerous characters
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'`]/g, '') // Remove HTML/script chars
    .slice(0, 5000); // Limit length
}

/**
 * Validate and parse with error handling
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Robust HTML sanitizer to prevent Stored/Reflected XSS in rich text descriptions.
 * Systematically strips:
 * - script, iframe, object, embed, applet, form, meta, link, style tags
 * - inline javascript: protocols in href attributes
 * - inline HTML event handlers (e.g. onload, onerror, onclick)
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // 1. Remove script tags and their content
  sanitized = sanitized.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');

  // 2. Remove style/link/meta/form/iframe/object/embed/applet tags
  sanitized = sanitized.replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object[^>]*>([\s\S]*?)<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed[^>]*>([\s\S]*?)<\/embed>/gi, '');
  sanitized = sanitized.replace(/<applet[^>]*>([\s\S]*?)<\/applet>/gi, '');
  sanitized = sanitized.replace(/<form[^>]*>([\s\S]*?)<\/form>/gi, '');
  sanitized = sanitized.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '');
  sanitized = sanitized.replace(/<meta[^>]*>/gi, '');
  sanitized = sanitized.replace(/<link[^>]*>/gi, '');

  // 3. Remove inline event handlers (e.g., onload, onerror, onclick, onmouseover)
  // Matches attributes starting with "on" followed by letters, optional whitespace, "=", optional whitespace, and quotes or non-whitespace
  sanitized = sanitized.replace(/\s+on[a-zA-Z]+\s*=\s*(['"][^'"]*['"]|[^>\s]+)/gi, '');

  // 4. Remove javascript: URIs in href or src attributes
  sanitized = sanitized.replace(/\s+(href|src)\s*=\s*(['"]\s*javascript:[^'"]*['"]|javascript:[^>\s]+)/gi, '');
  sanitized = sanitized.replace(/\s+(href|src)\s*=\s*(['"]\s*data:text\/html:[^'"]*['"]|data:text\/html:[^>\s]+)/gi, '');

  // 5. Remove HTML comments to prevent bypasses/obfuscation
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  return sanitized.trim();
}
