/*
 * This example demonstrates how to create an instance of LRUMemoryCache,
 * then set, get, and remove cache entries.
 */
import { LRUMemoryCache } from '@hiero-did-sdk/cache';

async function main() {
  const cache = new LRUMemoryCache();

  // Set a cache entry
  await cache.set('sampleKey', 'sampleValue');
  console.log('Set cache: sampleKey -> sampleValue');

  // Get the entry
  const value = await cache.get<string>('sampleKey');
  console.log('Got from cache:', value);

  // Remove the entry
  await cache.remove('sampleKey');
  const afterRemove = await cache.get('sampleKey');
  console.log('After remove, value is:', afterRemove);
}

main().catch(console.error);
