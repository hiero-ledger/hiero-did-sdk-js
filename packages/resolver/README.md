# @hashgraph-did-sdk/resolver

This package provides the `resolveDID` function, a core component of the Hashgraph DID SDK. It resolves Decentralized Identifiers (DIDs) registered on the Hedera network to their corresponding DID Documents. These documents contain crucial information about the DID subject, such as public keys and authentication mechanisms, which are cryptographically verified by the `resolveDID` function. By adhering to the DID specification and leveraging the Hedera Consensus Service (HCS), `resolveDID` ensures secure and verifiable DID resolution, enabling a wide range of DID operations.

## Features

- **DID Resolution:** Resolves Hedera DIDs to their corresponding DID Documents in various formats (JSON, JSON-LD, DID Resolution).
- **Cryptographic Verification:** Verifies the authenticity and integrity of DID Documents.
- **Hedera Network Support:** Supports resolving DIDs on the Hedera mainnet and testnet.
- **Error Handling:** Provides robust error handling for invalid DIDs, network issues, and unsupported formats.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and type safety.

## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/resolver
```

## Usage

Learn how to use the `resolveDID` function to resolve DID Documents in the [resolveDID Guide](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/resolveDID-guide.html).

## API Reference

Learn more in the [`resolveDID` API Reference](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/resolveDID-api.html).

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
