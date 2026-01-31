/**
 * API Response & Error Handling
 * - Standardized response format
 * - Consistent error codes
 * - Proper HTTP status codes
 * - Client-safe error messages
 */

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Success response builder
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Error response builder
 */
export function errorResponse(
  error: string,
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500
): ApiResponse {
  return {
    success: false,
    error: error.length > 200 ? error.slice(0, 200) : error, // Limit error message
    code,
    timestamp: Date.now(),
  };
}

/**
 * Paginated response builder
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      hasMore: page * pageSize < total,
    },
    timestamp: Date.now(),
  };
}

/**
 * Error codes and HTTP status mappings
 */
export const ErrorCodes = {
  // Auth errors (400-401)
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  UNAUTHORIZED: { status: 401, message: 'You are not authorized' },
  FORBIDDEN: { status: 403, message: 'Access forbidden' },
  TOKEN_EXPIRED: { status: 401, message: 'Session expired. Please log in again.' },
  INVALID_TOKEN: { status: 401, message: 'Invalid token' },

  // Validation errors (400)
  VALIDATION_ERROR: { status: 400, message: 'Validation failed' },
  INVALID_INPUT: { status: 400, message: 'Invalid input provided' },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Missing required field' },

  // Resource errors (404)
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  PRODUCT_NOT_FOUND: { status: 404, message: 'Product not found' },
  ORDER_NOT_FOUND: { status: 404, message: 'Order not found' },

  // Conflict errors (409)
  CONFLICT: { status: 409, message: 'Resource already exists' },
  EMAIL_EXISTS: { status: 409, message: 'Email already registered' },
  PRODUCT_OUT_OF_STOCK: { status: 409, message: 'Product out of stock' },

  // Rate limiting (429)
  RATE_LIMIT: { status: 429, message: 'Too many requests. Please try again later.' },

  // Server errors (500)
  INTERNAL_ERROR: { status: 500, message: 'Internal server error' },
  DATABASE_ERROR: { status: 500, message: 'Database error' },
  PAYMENT_ERROR: { status: 500, message: 'Payment processing failed' },
  EMAIL_ERROR: { status: 500, message: 'Failed to send email' },
} as const;

/**
 * Get HTTP status and message for error code
 */
export function getErrorInfo(code: keyof typeof ErrorCodes) {
  return ErrorCodes[code] || { status: 500, message: 'Unknown error' };
}

/**
 * Type-safe API error
 */
export class ApiError extends Error {
  constructor(
    public code: keyof typeof ErrorCodes,
    public statusCode: number = 500,
    message?: string
  ) {
    super(message || ErrorCodes[code]?.message || 'Unknown error');
    this.name = 'ApiError';
  }
}

/**
 * Catch and format errors from API handlers
 */
export function handleApiError(error: unknown): ApiResponse {
  if (error instanceof ApiError) {
    const info = getErrorInfo(error.code);
    return errorResponse(error.message, error.code, info.status);
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error);
    return errorResponse(
      error.message || 'Internal server error',
      'INTERNAL_ERROR',
      500
    );
  }

  console.error('Unknown error:', error);
  return errorResponse('Unknown error', 'INTERNAL_ERROR', 500);
}
