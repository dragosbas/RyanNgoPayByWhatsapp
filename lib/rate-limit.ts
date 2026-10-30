export type RateLimitDecision = { ok: true } | { ok: false };

export type RateLimiter = {
  consume(key: string, now?: number): RateLimitDecision;
};

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
}): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    consume(key, now = Date.now()) {
      const start = now - options.windowMs;
      const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > start);
      if (recent.length >= options.limit) {
        hits.set(key, recent);
        return { ok: false };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true };
    },
  };
}

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

/**
 * Per server process. Enough for this phase; it resets when the process restarts
 * and is not shared across multiple instances.
 */
export const rateLimiter = createRateLimiter({
  limit: positiveInt(process.env.RATE_LIMIT_MAX, 8),
  windowMs: positiveInt(process.env.RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000),
});
