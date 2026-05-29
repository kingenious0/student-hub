/**
 * Sliding Window In-Memory Rate Limiter
 * Suitable for Vercel/Next.js best-effort serverless node-level rate limiting.
 */

interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // Unix timestamp in seconds when the limit resets
}

// In-memory store for tracking requests
const rateLimitStore = new Map<string, number[]>();

// Periodically clean up expired entries from the store (every 5 minutes)
if (typeof globalThis !== 'undefined') {
    const globalAny = globalThis as any;
    if (!globalAny.__rateLimitCleanupInterval) {
        globalAny.__rateLimitCleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [ip, timestamps] of rateLimitStore.entries()) {
                // Keep only timestamps from the last 1 hour
                const active = timestamps.filter(t => t > now - 3600 * 1000);
                if (active.length === 0) {
                    rateLimitStore.delete(ip);
                } else {
                    rateLimitStore.set(ip, active);
                }
            }
        }, 5 * 60 * 1000);
        
        // Prevent blocking server shutdown in Node environment
        if (globalAny.__rateLimitCleanupInterval.unref) {
            globalAny.__rateLimitCleanupInterval.unref();
        }
    }
}

/**
 * Checks if a given IP address has exceeded the rate limit
 * @param ip The client IP address
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds (e.g., 60000 for 1 minute)
 */
export async function rateLimit(ip: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const timestamps = rateLimitStore.get(ip) || [];
    
    // Filter out timestamps that are outside the current window
    const windowStart = now - windowMs;
    const currentWindowTimestamps = timestamps.filter(t => t > windowStart);
    
    if (currentWindowTimestamps.length >= limit) {
        // Limit exceeded. Next reset time is the oldest timestamp in the current window + windowMs
        const oldestTimestamp = currentWindowTimestamps[0];
        const resetTime = Math.ceil((oldestTimestamp + windowMs) / 1000);
        
        return {
            success: false,
            limit,
            remaining: 0,
            reset: resetTime
        };
    }
    
    // Allow request: record the current timestamp
    currentWindowTimestamps.push(now);
    rateLimitStore.set(ip, currentWindowTimestamps);
    
    // Calculate reset time (estimate reset based on first timestamp in the window)
    const resetTime = Math.ceil((currentWindowTimestamps[0] + windowMs) / 1000);
    
    return {
        success: true,
        limit,
        remaining: limit - currentWindowTimestamps.length,
        reset: resetTime
    };
}
