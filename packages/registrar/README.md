# @hiero-did-sdk/registrar

This package provides the core functions for registering and managing Decentralized Identifiers (DIDs) on the Hedera network within the Hiero DID SDK.
It offers a streamlined interface for creating, updating, and deactivating DIDs, ensuring secure and verifiable DID operations.

Specifically, this package provides the `createDID`, `updateDID`, and `deactivateDID` functions. These functions allow you to:

- **`createDID`:** Generate and register a new DID on the Hedera network.
- **`updateDID`:** Update an existing DID by modifying its associated DID Document.
- **`deactivateDID`:** Deactivate a DID, effectively revoking it.

These functions interact with the Hedera Consensus Service (HCS) to ensure that DID operations are securely and verifiably recorded on the Hedera network. By adhering to the DID specification, these functions enable interoperable and standardized DID management.

## Features

- **DID Creation:** Generates and registers new DIDs on the Hedera network with customizable options.
- **DID Updating:** Updates existing DIDs, allowing modifications to DID Documents.
- **DID Deactivation:** Deactivates registered DIDs on the Hedera network, revoking their validity.
- **Key Management:** Supports various key types and formats for DID controllers and verification methods.
- **DID Document Generation:** Automatically generates DID Documents conforming to the DID specification.
- **Hedera Network Support:** Supports DID operations on the Hedera mainnet and testnet.
- **Error Handling:** Provides robust error handling for invalid input, network issues, and other potential problems.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and type safety.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/registrar
```

## Usage

This package provides three main functions for managing DIDs: `createDID`, `updateDID`, and `deactivateDID`.

Learn how to use the `createDID` function to create a new DID in the [`createDID` Guide](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/createDID-guide.html).

Learn how to use the `updateDID` function to update an existing DID in the [`updateDID` Guide](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/updateDID-guide.html).

Learn how to use the `deactivateDID` function to deactivate a DID in the [`deactivateDID` Guide](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/deactivateDID-guide.html).

## API Reference

Learn more in the [`createDID` API reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/createDID-api.html).

Learn more in the [`updateDID` API reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/updateDID-api.html).

Learn more in the [`deactivateDID` API reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/deactivateDID-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hiero DID SDK](https://github.com/hiero-ledger/hiero-did-sdk-js) - The official repository for the Hiero DID SDK, containing the complete source code and documentation.
- [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.
