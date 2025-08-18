/*
 * This example demonstrates how to set cache entries with expiration,
 * how entries expire after time, and how to clean up expired entries.
 */
import { LRUMemoryCache } from '@hiero-did-sdk/cache';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const cache = new LRUMemoryCache();

  // Store a value with 2 seconds expiration
  await cache.set('tempKey', 'temporaryValue', 2);
  console.log('Set temporary cache entry with 2 seconds TTL');

  // Get immediately
  console.log('Value immediately:', await cache.get('tempKey'));

  // Wait 3 seconds
  await delay(3000);

  // Try to get expired value
  console.log('Value after 3 seconds:', await cache.get('tempKey')); // should be null

  // Cleanup expired entries
  await cache.cleanupExpired();
  console.log('Expired entries cleaned up');
}

main().catch(console.error);
