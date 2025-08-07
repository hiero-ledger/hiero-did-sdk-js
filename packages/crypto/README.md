# @hiero-did-sdk/crypto

This package provides cryptographic utilities for the Hiero DID SDK JS.

## Features

- **SHA-256 Hashing:** Provides a simple API for generating SHA-256 hashes.
- **Cross-Platform Compatibility:** Automatically detects and uses the appropriate cryptographic implementation based on the runtime environment.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/crypto
```

## Usage

The package provides a `Crypto` class with static methods for cryptographic operations:

```typescript
import { Crypto } from '@hiero-did-sdk/crypto';

// Generate SHA-256 hash from a string
const hash = Crypto.sha256('Hello, world!');
console.log(hash); // Outputs the SHA-256 hash in hexadecimal format

// Generate SHA-256 hash from a Buffer
const buffer = Buffer.from('Hello, world!', 'utf-8');
const hashFromBuffer = Crypto.sha256(buffer);

// Generate SHA-256 hash from a Uint8Array
const uint8Array = new TextEncoder().encode('Hello, world!');
const hashFromUint8Array = Crypto.sha256(uint8Array);
```

## API Reference

Learn more in the [Crypto API Reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/crypto-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hiero DID SDK](https://github.com/hiero-ledger/hiero-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.