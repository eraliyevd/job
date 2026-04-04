/**
 * In-memory rate limiter.
 * Production with multiple instances → swap store for Upstash Redis.
 */

interface RateLimitEntry {
  count:     number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Prune expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetTime < now) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit:  number;  // max requests
  window: number;  // seconds
}

export interface RateLimitResult {
  success:   boolean;
  remaining: number;
  reset:     number;  // ms timestamp
  retryAfter?: number; // seconds until reset
}

export async function rateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const now      = Date.now();
  const windowMs = options.window * 1000;
  const entry    = store.get(key);

  if (!entry || entry.resetTime < now) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: options.limit - 1, reset: now + windowMs };
  }

  if (entry.count >= options.limit) {
    return {
      success:    false,
      remaining:  0,
      reset:      entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    success:   true,
    remaining: options.limit - entry.count,
    reset:     entry.resetTime,
  };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Apply rate limit and return 429 response if exceeded */
export async function applyRateLimit(
  req: Request,
  prefix: string,
  options: RateLimitOptions
): Promise<Response | null> {
  const ip     = getClientIp(req);
  const result = await rateLimit(`${prefix}:${ip}`, options);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please slow down.",
        retryAfter: result.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type":          "application/json",
          "Retry-After":           String(result.retryAfter ?? 60),
          "X-RateLimit-Limit":     String(options.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset":     String(Math.ceil(result.reset / 1000)),
        },
      }
    );
  }
  return null; // OK
}
