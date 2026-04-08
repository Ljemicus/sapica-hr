import { Redis } from '@upstash/redis';

// Redis client singleton
let redis: Redis | null = null;

/**
 * Gets or creates the Redis client
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Upstash Redis credentials not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    }

    redis = new Redis({
      url,
      token,
    });
  }

  return redis;
}

/**
 * Checks if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// In-memory cache fallback
const memoryCache = new Map<string, { value: unknown; expires: number }>();
const MEMORY_CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastMemoryCleanup = Date.now();

function cleanupMemoryCache(): void {
  const now = Date.now();
  if (now - lastMemoryCleanup < MEMORY_CLEANUP_INTERVAL) return;

  lastMemoryCleanup = now;
  for (const [key, entry] of memoryCache) {
    if (now > entry.expires) {
      memoryCache.delete(key);
    }
  }
}

interface CacheOptions {
  /** TTL in seconds (default: 300 = 5 minutes) */
  ttl?: number;
  /** Cache key prefix */
  prefix?: string;
}

/**
 * Gets a value from cache
 * @param key - Cache key
 * @returns Cached value or null
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured()) {
    cleanupMemoryCache();
    const entry = memoryCache.get(key);
    if (!entry || Date.now() > entry.expires) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  try {
    const client = getRedisClient();
    const value = await client.get<string>(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('[cache] Redis get error:', error);
    return null;
  }
}

/**
 * Sets a value in cache
 * @param key - Cache key
 * @param value - Value to cache
 * @param options - Cache options
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 300 } = options; // Default 5 minutes

  if (!isRedisConfigured()) {
    cleanupMemoryCache();
    memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });
    return;
  }

  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(value), { ex: ttl });
  } catch (error) {
    console.error('[cache] Redis set error:', error);
  }
}

/**
 * Deletes a value from cache
 * @param key - Cache key
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!isRedisConfigured()) {
    memoryCache.delete(key);
    return;
  }

  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('[cache] Redis del error:', error);
  }
}

/**
 * Clears cache by pattern (Redis only, memory fallback clears all)
 * @param pattern - Key pattern to match (e.g., "sitter:*")
 */
export async function cacheClearPattern(pattern: string): Promise<void> {
  if (!isRedisConfigured()) {
    // Memory fallback: clear all keys matching pattern
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
    return;
  }

  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    console.error('[cache] Redis clear pattern error:', error);
  }
}

/**
 * Cache wrapper for async functions
 * @param fn - Function to cache
 * @param key - Cache key
 * @param options - Cache options
 * @returns Cached or fresh result
 */
export async function withCache<T>(
  fn: () => Promise<T>,
  key: string,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  await cacheSet(key, result, options);
  return result;
}

/**
 * Generates a cache key from parts
 * @param parts - Key parts
 * @returns Combined cache key
 */
export function cacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(':');
}

// Predefined cache TTLs
export const CacheTTL = {
  // Short-lived: frequently changing data
  SITTER_LIST: 60,        // 1 minute
  SEARCH_RESULTS: 60,     // 1 minute
  AVAILABILITY: 30,       // 30 seconds

  // Medium-lived: semi-static data
  BLOG_POSTS: 600,        // 10 minutes
  BLOG_POST: 1800,        // 30 minutes
  VETERINARIANS: 300,     // 5 minutes
  ADOPTION_LISTINGS: 300, // 5 minutes

  // Long-lived: rarely changing data
  STATIC_CONTENT: 3600,   // 1 hour
  USER_PROFILE: 300,      // 5 minutes
  REVIEWS: 120,           // 2 minutes
} as const;

// Predefined cache prefixes
export const CachePrefix = {
  SITTER: 'sitter',
  BLOG: 'blog',
  VET: 'vet',
  ADOPTION: 'adoption',
  SEARCH: 'search',
  USER: 'user',
  REVIEW: 'review',
  STATIC: 'static',
} as const;
