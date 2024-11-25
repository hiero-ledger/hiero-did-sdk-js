# @hashgraph-did-sdk/registrar

This package provides the [Registrar](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/registrar/index.html), a core component of the [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js) responsible for registering and updating Decentralized Identifiers (DIDs) on the Hedera network. It facilitates the creation and management of DIDs by interacting with the Hedera Consensus Service (HCS), ensuring the secure and verifiable registration of DID documents. Supporting the Hedera DID method, the Registrar adheres to the DID specification and provides a streamlined interface for developers to integrate DID management into their applications.

## Features

- **DID Creation:** Generate and register new DIDs with customizable configurations.
- **DID Updating:** Update existing DIDs, including adding or removing verification methods and services.
- **DID Deactivation:** Deactivate DIDs to revoke their validity.
- **Simplified Interface:**  Provides an intuitive and easy-to-use API for managing DIDs.
- **Integration with Hedera:** Seamlessly integrates with the Hedera JavaScript SDK for ledger interactions.


## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/registrar
```

## Usage

This package is intended for internal use within the `@hashgraph-did-sdk`. However, it can be used independently if needed.

**Note:** This package exports functions for creating, updating, and deactivating DIDs. Each function provides flexibility in how you interact with the Hedera network. You can provide your own `Client`, `Publisher`, and `Signer` instances, or rely on the built-in mechanisms for these components.


### Creating a DID

```javascript
import { createDID } from '@hashgraph-did-sdk/registrar';

const { did, didDocument, privateKey } = await createDID({ 
  // Optionally provide a client, publisher, signer, or private key
});

console.log('DID:', did);
console.log('DID Document:', didDocument); 
```

For more details, see the [`createDID` function documentation](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components-api/createDID-api.html).


### Updating a DID

```javascript
import { updateDID } from '@hashgraph-did-sdk/registrar';

const { did, didDocument } = await updateDID({
  did: 'did:hedera:...',  // The DID to update
  updates: [
    // Array of update operations
    { operation: 'add-verification-method', ... },
    { operation: 'remove-service', ... },
  ],
  // Optionally provide a client, publisher, signer, or private key
});
```

For more details, see the [`updateDID` function documentation](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components-api/updateDID-api.html).


### Deactivating a DID

```javascript
import { deactivateDID } from '@hashgraph-did-sdk/registrar';

const { did, didDocument } = await deactivateDID({
  did: 'did:hedera:...'  // The DID to deactivate
  // Optionally provide a client, publisher, signer, or private key
});
```

For more details, see the [`deactivateDID` function documentation](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components-api/deactivateDID-api.html).


## API Reference

Detailed API documentation is available in the [Hashgraph DID SDK documentation](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/).

## Error Handling

The functions in this package may throw errors under various conditions, such as:

- **Invalid DID format:** If the provided DID string is not in a valid format.
- **Network errors:** If there are issues connecting to or interacting with the Hedera network.
- **Invalid update operations:** If the provided update operations for a DID are invalid.


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