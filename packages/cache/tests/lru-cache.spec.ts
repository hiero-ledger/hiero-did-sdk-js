import { LRUMemoryCache } from '../src';

describe('LRUMemoryCache', () => {
  let cache: LRUMemoryCache;

  cache = new LRUMemoryCache(); // Initialize with the default max size

  beforeEach(() => {
    cache = new LRUMemoryCache(3); // Initialize with a max size of 3
  });

  afterEach(async () => {
    await cache.clear();
  });

  it('should return null when getting a non-existent key', async () => {
    const result = await cache.get<string>('non_existent_key');
    expect(result).toBeNull();
  });

  it('should set and get a value correctly', async () => {
    await cache.set('key1', 'value1');
    let result = await cache.get<string>('key1');
    expect(result).toBe('value1');

    await cache.set('key1', 'value2');
    result = await cache.get<string>('key1');
    expect(result).toBe('value2');
  });

  it('should evict the oldest item when max size is reached', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.set('key3', 'value3');
    await cache.set('key4', 'value4');

    const result = await cache.get<string>('key1');

    expect(result).toBeNull(); // key1 should have been evicted
  });

  it('should remove a value by key', async () => {
    await cache.set('key1', 'value1');
    await cache.remove('key1');

    const result = await cache.get<string>('key1');
    expect(result).toBeNull();
  });

  it('should cleanup all items from the cache', async () => {
    await cache.set('key1', 'value1');
    await cache.clear();

    const result = await cache.get<string>('key1');
    expect(result).toBeNull();
  });

  it('should cleanup expired items', async () => {
    jest.useFakeTimers();

    await cache.set('key1', 'value1', 2); // Expires in 2 seconds

    jest.advanceTimersByTime(3000);

    const result = await cache.get<string>('key1');
    expect(result).toBeNull(); // Key should have expired and been removed
    jest.useRealTimers();
  });

  it('should push up the items when read from the cache', async () => {
    await cache.set('key1', 'value1');
    await cache.set('key2', 'value2');
    await cache.set('key3', 'value3');

    // @ts-expect-error Access to private property
    const getInternalKeysArray = () => Array.from(cache._cache.keys());

    expect(getInternalKeysArray()).toEqual(['key1', 'key2', 'key3']);

    await cache.get('key2');
    expect(getInternalKeysArray()).toEqual(['key1', 'key3', 'key2']);

    await cache.get('key1');
    expect(getInternalKeysArray()).toEqual(['key3', 'key2', 'key1']);
  });
});
