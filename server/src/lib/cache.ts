export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory TTL cache.
 *
 * The interface is intentionally small so a Redis-backed implementation
 * (cacheWithRedis.ts) can be dropped in later without touching callers.
 */
export interface Cache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  delete(key: string): void;
  has(key: string): boolean;
  clear(): void;
}

class MemoryCache implements Cache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache: Cache = new MemoryCache();

/** Build a namespaced cache key. */
export function cacheKey(namespace: string, ...parts: Array<string | number>): string {
  return `${namespace}:${parts.join(":")}`;
}