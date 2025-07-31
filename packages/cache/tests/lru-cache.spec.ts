import { LRUMemoryCache } from '../src';

describe('LRUMemoryCache', () => {
  let cache: LRUMemoryCache;

  cache = new LRUMemoryCache(); // Initialize with the default max size

  beforeEach(() => {
    cache = new LRUMemoryCache(3); // Initialize with a max size of 3
  });

  afterEach(async () => {
    await cache.clear(); // Clean up the cache after each test
  });

  // Test case: Getting a value from an empty cache should return null
  it('should return null when getting a non-existent key', async () => {
    const result = await cache.get<string>('non_existent_key');
    expect(result).toBeNull();
  });

  // Test case: Setting and getting a value in the cache
  it('should set and get a value correctly', async () => {
    await cache.set('key1', 'value1');
    let result = await cache.get<string>('key1');
    expect(result).toBe('value1');

    await cache.set('key1', 'value2');
    result = await cache.get<string>('key1');
    expect(result).toBe('value2');
  });

  // Test case: Cache should respect max size and evict the oldest item
  it('should evict the oldest item when max size is reached', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.set('key3', 'value3');
    await cache.set('key4', 'value4');

    const result = await cache.get<string>('key1');

    expect(result).toBeNull(); // key1 should have been evicted
  });

  // Test case: Remove an item from the cache
  it('should remove a value by key', async () => {
    await cache.set('key1', 'value1');
    await cache.remove('key1');

    const result = await cache.get<string>('key1');
    expect(result).toBeNull(); // Key should not exist in cache after removal
  });

  // Test case: Cleanup the entire cache
  it('should cleanup all items from the cache', async () => {
    await cache.set('key1', 'value1');
    await cache.clear();

    const result = await cache.get<string>('key1');
    expect(result).toBeNull(); // Key should not exist in cache after cleanup
  });

  // Test case: Cleanup expired items from the cache
  it('should cleanup expired items', async () => {
    jest.useFakeTimers();

    await cache.set('key1', 'value1', 2); // Expires in 2 seconds

    jest.advanceTimersByTime(3000);

    const result = await cache.get<string>('key1');
    expect(result).toBeNull(); // Key should have expired and been removed
    jest.useRealTimers();
  });

  // Test case: Cleanup expired
  it('should get all items except expired', async () => {
    jest.useFakeTimers();

    await cache.set('key1', 'value1', 1);
    jest.advanceTimersByTime(1000);
    await cache.set('key2', 'value2', 1);
    jest.advanceTimersByTime(2000);
    await cache.set('key3', 'value3', 10);

    await cache.cleanupExpired();

    const result = await cache.getAll<string>();

    expect(result).toEqual([{ key: 'key3', value: 'value3' }]);
    jest.useRealTimers();
  });

  // Test case: Get all items in the cache
  it('should get all items from the cache', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');

    const result = await cache.getAll<string>();

    expect(result).toEqual([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
    ]);
  });

  // Test case: Get all items in the cache
  it('should push up the items when read from the cache', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.set('key3', 'value3');

    let data = await cache.getAll();
    expect(data.map((e) => e.key)).toEqual(['key1', 'key2', 'key3']);

    await cache.get('key2');
    data = await cache.getAll();
    expect(data.map((e) => e.key)).toEqual(['key1', 'key3', 'key2']);

    await cache.get('key1');
    data = await cache.getAll();
    expect(data.map((e) => e.key)).toEqual(['key3', 'key2', 'key1']);
  });
});
