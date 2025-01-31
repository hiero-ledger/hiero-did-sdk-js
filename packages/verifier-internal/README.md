# @hashgraph-did-sdk/verifier-internal

This package provides the `Verifier` class, a core component of the Hashgraph DID SDK. It enables digital signature verification for Decentralized Identifiers (DIDs) using the ED25519 algorithm. The `Verifier` class adheres to the `Verifier` interface, providing a standardized way to handle cryptographic operations within the Hedera DID ecosystem.

## Features

- **Verification:** Efficiently verify signatures, ensuring data integrity and authenticity within your DID implementations.
- **Compatibility:** Supports both raw and multibase-formatted keys for seamless integration with different systems and libraries.
- **Security:** Designed with security best practices to safeguard your private keys and ensure the reliability of signature operations.

## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/verifier-internal
```

## Usage

Learn how to use the `Verifier` class to verify signatures in the [Verifier Guide](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/verifier-guide.html).

## API Reference

Learn more in the [`Verifier` API Reference](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/verifier-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.
