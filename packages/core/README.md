# @hashgraph-did-sdk/core

This package forms the foundation of the [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js), providing essential interfaces, utilities, and validation tools for working with Decentralized Identifiers (DIDs) on the Hedera network.  It enables developers to seamlessly integrate DIDs into their applications by offering:

- **Standardized interfaces:**  Defines consistent structures for DID operations and interactions with Hedera, including `DIDMessage`, `Signer`, `Publisher`, and `DIDDocument`.
- **Key management utilities:** Provides the `KeysUtility` class for comprehensive handling and transformation of cryptographic keys in various formats.
- **Robust DID validation:**  Ensures DIDs comply with the specification using the `isHederaDID` function, which performs rigorous checks with regular expressions.


## Features

- **Interfaces:** Exports core interfaces for DID operations and Hedera interactions:
    - `DIDMessage`:  Standardized structure for creating and processing DID messages.
    - `Signer`:  Interface for signing and verifying operations.
    - `Publisher`: Interface for submitting transactions to the Hedera network.
    - `DIDDocument`: Representation of a DID Document.
    - `PublicKey`: Interface for representing public keys.
    - `Network`: Interface for defining Hedera network configurations.
    - `VerificationMethodProperties`: Interface for defining verification method properties.
- **Key Management:** Exports the `KeysUtility` class with a wide range of functions for:
    - **Transforming keys:** Convert keys between different formats (bytes, base58, multibase, Hedera `PublicKey`).
    - **Loading keys:** Load keys from various sources (bytes, base58, DER string, Hedera `PublicKey`).
    - **Exporting keys:** Export keys in different formats for use in other applications or systems.
- **DID Validation:** Exports the `isHederaDID` function, which uses regular expressions to validate Hedera DIDs, ensuring they adhere to the DID specification:
    - Checks for correct DID format, including the `did:hedera` prefix, network, public key, and topic ID.
    - Validates the network identifier against allowed values (mainnet, testnet).
    - Uses a regular expression to validate the base58-encoded public key.
- **TypeScript Support:**  Built with TypeScript to enhance developer experience and code maintainability.


## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/core
```

## Usage

This package is primarily intended for internal use within the `@hashgraph-did-sdk`. However, some of its utilities can be used independently.

### DID Message

The `DIDMessage` interface provides a base structure for creating DID messages. You can implement this interface to create classes for specific DID operations, such as creating, updating, or deactivating DIDs.

```typescript
import { DIDMessage } from '@hashgraph-did-sdk/core';

class MyDIDMessage implements DIDMessage {
  // Implement your DID operation logic here
}
```

### Key Utilities

The `KeysUtility` class provides helpful functions for working with cryptographic keys.

```typescript
import { KeysUtility } from '@hashgraph-did-sdk/core';

// Load a key from a Hedera PublicKey
const keyUtil = KeysUtility.fromPublicKey(publicKey); 

// Transform the key to different formats
const publicKeyMultibase = keyUtil.toMultibase();
const publicKeyBase58 = keyUtil.toBase58(); 
const publicKeyBytes = keyUtil.toBytes();
```

### DID Validation

The `isHederaDID` function allows you to validate Hedera DIDs.

```typescript
import { isHederaDID } from '@hashgraph-did-sdk/core';

if (isHederaDID(did)) {
  // DID is valid
}
```

## Error Handling

This package may throw errors under certain conditions, such as when attempting to process invalid DID messages or perform unsupported key operations. 

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References
  * [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
  * [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.