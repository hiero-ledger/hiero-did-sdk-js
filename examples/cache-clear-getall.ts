/*
 * This example demonstrates how to clear the cache and retrieve all
 * current cache entries using LRUMemoryCache.
 */
import { LRUMemoryCache } from '@hiero-did-sdk/cache';

async function main() {
  const cache = new LRUMemoryCache();

  // Add some cache entries
  await cache.set('key1', 'value1');
  await cache.set('key2', { data: 123 });

  // Get all entries
  const allEntries = await cache.getAll();
  console.log('All cache entries:', allEntries);

  // Clear cache
  await cache.clear();
  console.log('Cache cleared');

  // Confirm cache is empty
  const emptyEntries = await cache.getAll();
  console.log('Entries after clear:', emptyEntries);
}

main().catch(console.error);
