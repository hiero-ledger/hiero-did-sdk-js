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

Learn how to use the LRUMemoryCache in the [Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/cache-guide.html).

### Examples

- [cache-set-get](../../examples/cache-set-get.ts) - Demonstrates how to set, get, and remove cache entries.
- [cache-expiry-cleanup](../../examples/cache-expiry-cleanup.ts) - Demonstrates how to use expiration for cache entries and clean up expired items.
- [cache-clear-getall](../../examples/cache-clear-getall.ts) - Demonstrates how to clear the cache and retrieve all current cache entries.

## API Reference

See detailed API specifications and available methods in the [API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/cache-api.html).

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
