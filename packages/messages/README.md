# @hashgraph-did-sdk/messages

This package provides a comprehensive set of classes for constructing and handling DID messages within the [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js). These messages facilitate various DID operations on the Hedera network, such as creating, updating, and deactivating DIDs, as well as managing their associated keys and services.

## Features

- **Message Classes:** Offers a variety of DID message classes, including:
    - `DIDOwnerMessage`: For creating and managing DID ownership.
    - `DIDAddVerificationMethodMessage`: For adding verification methods to a DID document.
    - `DIDRemoveVerificationMethodMessage`: For removing verification methods from a DID document.
    - `DIDDeactivateMessage`: For deactivating a DID.
- **Serialization and Deserialization:**  Provides methods for serializing messages to byte arrays and deserializing them back into message objects.
- **Lifecycle Integration:**  Seamlessly integrates with the `@hashgraph-did-sdk/lifecycle` package to define and execute message lifecycles.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and type safety.

## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/messages
```

## Usage

This package is primarily intended for internal use within the `@hashgraph-did-sdk`. However, its message classes can be used independently to construct and manipulate DID messages.

### Creating a DID Owner Message

```typescript
import { DIDOwnerMessage } from '@hashgraph-did-sdk/messages';

const message = new DIDOwnerMessage({
  publicKey,
  network: 'testnet',
  topicId: '0.0.1234',
});

// Serialize the message to a byte array
const messageBytes = message.toBytes();

// ... later, deserialize the message
const deserializedMessage = DIDOwnerMessage.fromBytes(messageBytes);
```

### Adding a Verification Method

```typescript
import { DIDAddVerificationMethodMessage } from '@hashgraph-did-sdk/messages';

const message = new DIDAddVerificationMethodMessage({
  did: 'did:hedera:testnet:...',
  controller: 'did:hedera:testnet:...',
  property: 'verificationMethod', 
  publicKeyMultibase: 'z...',
  id: '#key-1',
});
```

### Removing a Verification Method

```typescript
import { DIDRemoveVerificationMethodMessage } from '@hashgraph-did-sdk/messages';

const message = new DIDRemoveVerificationMethodMessage({
  did: 'did:hedera:testnet:...',
  property: 'verificationMethod',
  id: '#key-1',
});
```

### Deactivating a DID

```typescript
import { DIDDeactivateMessage } from '@hashgraph-did-sdk/messages';

const message = new DIDDeactivateMessage({
  did: 'did:hedera:testnet:...'
});
```

## Error Handling

The message classes may throw errors under certain conditions, such as when providing invalid DID formats or attempting unsupported operations. Refer to the class documentation for specific error conditions.

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