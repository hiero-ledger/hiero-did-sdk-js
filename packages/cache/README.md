# @hiero-did-sdk/cache

This package provides caching utilities for the Hiero DID SDK JS.
It implements Least Recently Used (LRU) memory cache to improve performance by reducing redundant operations and network calls.

## Features

- **LRU Memory Cache:** Implements an efficient Least Recently Used (LRU) caching strategy.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/cache
```

## Usage

The package provides an `LRUMemoryCache` class that implements the `Cache` interface from the core package:

```typescript
import { LRUMemoryCache } from '@hiero-did-sdk/cache';

// Create a cache with default size (10000 entries)
const cache = new LRUMemoryCache();

// Or specify a custom size
const smallCache = new LRUMemoryCache(100);

// Store a value in the cache
await cache.set('key1', 'value1');

// Store a value with expiration (in seconds)
await cache.set('key2', 'value2', 60); // Expires after 60 seconds

// Retrieve a value from the cache
const value = await cache.get('key1');

// Remove a value from the cache
await cache.remove('key1');

// Clean up expired entries
await cache.cleanupExpired();

// Clear the entire cache
await cache.clear();

// Get all entries in the cache
const allEntries = await cache.getAll();
```

## API Reference

Learn more in the [Cache API Reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/cache-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hiero DID SDK](https://github.com/hiero-ledger/hiero-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [LRU Cache Algorithm](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)) - Information about the Least Recently Used cache replacement policy implemented in this package.