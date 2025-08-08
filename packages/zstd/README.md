# @hiero-did-sdk/zstd

This package provides Zstandard (Zstd) compression utilities for the Hiero DID SDK JS.

## Features

- **Zstd Compression and Decompression:** Provides a simple API for compressing and decompressing data using the Zstandard algorithm.
- **Cross-Platform Compatibility:** Automatically detects and uses the appropriate Zstd implementation based on the runtime environment.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/zstd
```

## Usage

The package provides a `Zstd` class with static methods for compression and decompression:

```typescript
import { Zstd } from '@hiero-did-sdk/zstd';

// Compress data
const originalData = new Uint8Array([1, 2, 3, 4, 5]);
const compressedData = Zstd.compress(originalData);

// Decompress data
const decompressedData = Zstd.decompress(compressedData);
```

## API Reference

Learn more in the [Zstd API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/zstd-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hiero DID SDK](https://github.com/hiero-ledger/hiero-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [Zstandard](https://facebook.github.io/zstd/) - The official Zstandard website, providing information about the compression algorithm used in this package.