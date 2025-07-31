import { Cache } from '@hiero-did-sdk/core';

interface KeyValue<CacheValue> {
  key: string;
  value: CacheValue;
}

interface CacheEntry<CacheValue> {
  value: CacheValue;
  expiresAt?: number;
}

const DEFAULT_CACHE_SIZE = 10000;

export class LRUMemoryCache implements Cache {
  private readonly _maxSize: number;
  private readonly _cache: Map<string, CacheEntry<unknown>>;

  constructor(maxSize: number = DEFAULT_CACHE_SIZE) {
    this._maxSize = maxSize;
    this._cache = new Map();
  }

  get<CacheValue>(key: string): Promise<CacheValue | null> {
    if (!this._cache.has(key)) {
      return null;
    }

    const entry = this._cache.get(key);

    if (!entry || (entry.expiresAt && entry.expiresAt < Date.now())) {
      this._cache.delete(key);
      return null;
    }

    // Refresh cache entry, so the key will be the last to clean up
    this._cache.delete(key);
    this._cache.set(key, entry);

    return Promise.resolve(entry.value as CacheValue);
  }

  set<CacheValue>(key: string, value: CacheValue, expiresInSeconds?: number): Promise<void> {
    if (this._cache.has(key)) {
      this._cache.delete(key);
    } else {
      if (this._cache.size >= this._maxSize) {
        const oldestKey = this._cache.keys().next().value;
        if (typeof oldestKey === 'string') {
          this._cache.delete(oldestKey);
        }
      }
    }

    const entry: CacheEntry<CacheValue> = {
      value,
      expiresAt: expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : undefined,
    };

    this._cache.set(key, entry);

    return Promise.resolve();
  }

  remove(key: string): Promise<void> {
    this._cache.delete(key);
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this._cache.clear();
    return Promise.resolve();
  }

  cleanupExpired(): Promise<void> {
    const now = Date.now();
    for (const [key, entry] of this._cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this._cache.delete(key);
      }
    }
    return Promise.resolve();
  }

  getAll<CacheValue>(): Promise<KeyValue<CacheValue>[]> {
    const entries = [...this._cache] as [string, CacheEntry<CacheValue>][];
    return Promise.resolve(entries.map(([key, entry]) => ({ key, value: entry.value }) as KeyValue<CacheValue>));
  }
}
