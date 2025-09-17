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

  console.log('Initial cache entries:');
  console.log('Entry with a key "key1"', await cache.get('key1'));
  console.log('Entry with a key "key2"', await cache.get('key2'));

  // Clear cache
  await cache.clear();
  console.log('Cache cleared');

  console.log('Cache entries after clearing:');
  console.log('Entry with a key "key1"', await cache.get('key1'));
  console.log('Entry with a key "key2"', await cache.get('key2'));
}

main().catch(console.error);
