interface Bucket {
  timestamps: number[];
}

interface RateLimitStore {
  buckets: Map<string, Bucket>;
}

const globalStore = globalThis as typeof globalThis & {
  __fineprintRateLimits?: RateLimitStore;
};

const store: RateLimitStore =
  globalStore.__fineprintRateLimits ??
  (globalStore.__fineprintRateLimits = { buckets: new Map() });

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = store.buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((time) => now - time < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((windowMs - (now - oldest)) / 1000),
      ),
    };
  }

  bucket.timestamps.push(now);
  store.buckets.set(key, bucket);

  if (store.buckets.size > 5_000) {
    for (const [bucketKey, value] of store.buckets) {
      if (value.timestamps.length === 0) store.buckets.delete(bucketKey);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  return `${scope}:${ip}`;
}
