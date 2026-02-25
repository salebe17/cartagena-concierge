import { Redis } from "@upstash/redis";

// Provide a fallback for local development or if env vars are missing
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || "";
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

/**
 * Helper to cache results from Supabase or external APIs.
 * @param key The unique cache key
 * @param fetcher The async function to fetch data if cache misses
 * @param ttl Time to live in seconds (default: 60)
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60,
): Promise<T> {
  if (!redisUrl || !redisToken) {
    // If Redis is not configured, bypass cache
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fetcher();
    await redis.set(key, data, { ex: ttl });
    return data;
  } catch (error) {
    console.warn(`Redis Cache Error for key "${key}":`, error);
    // Fallback to fetcher on Redis failure
    return fetcher();
  }
}
