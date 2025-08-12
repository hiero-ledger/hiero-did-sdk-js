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

Learn how to use the Crypto module in the [Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/crypto-guide.html).

### Examples

- [crypto-sha256-string](../../examples/crypto-sha256-string.ts) - Demonstrates how to compute the SHA-256 hash of a string.
- [crypto-sha256-uint8array](../../examples/crypto-sha256-uint8array.ts) - Demonstrates how to compute the SHA-256 hash of a Uint8Array.

## API Reference

See detailed API specifications and available methods in the [API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/crypto-api.html).


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
