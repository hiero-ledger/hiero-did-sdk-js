# @hashgraph-did-sdk/signer-internal

This package provides a ED25519-based signer component, essential for cryptographic operations within the Hedera ecosystem. As part of the [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js), it offers a concrete implementation of the [Signer](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/signer/guide.html) interface, enabling secure key management and digital signature generation for Decentralized Identifiers (DIDs). 


## Features

- **Key Management**: Generate ED25519 key pairs or initialize from existing keys, providing flexibility in key management workflows.
- **Signing and Verification**: Efficiently sign messages and verify signatures, ensuring data integrity and authenticity within your DID implementations.
- **Compatibility**:  Supports both raw and DER-formatted keys for seamless integration with different systems and libraries.
- **Security**:  Designed with security best practices to safeguard your private keys and ensure the reliability of signature operations.


## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/signer-internal
```

## Usage

This package is intended for internal use within the `@hashgraph-did-sdk`. However, it can be used independently if needed.

### Importing the Package

```javascript
import { InternalSigner } from '@hashgraph-did-sdk/signer-internal';
```

This line imports the `InternalSigner` class from the package.

### Generating a New Key Pair

```javascript
const signer = InternalSigner.generate();

console.log('Private Key (DER):', signer.privateKey.toStringDer());
console.log('Public Key (DER):', signer.publicKey()); 
```

This code generates a new key pair and logs the private and public keys in DER format.

### Initializing with an Existing Key

```javascript
import { PrivateKey } from '@hashgraph/sdk';

const privateKey = PrivateKey.generateED25519(); // or load your key
const signer = new InternalSigner(privateKey.toStringDer());

console.log('Public Key (DER):', signer.publicKey());
```

This example shows how to initialize the signer with an existing private key from the `@hashgraph/sdk`.

### Signing a Message

```javascript
const message = Buffer.from('This is a message to be signed.');
const signature = signer.sign(message);

console.log('Signature:', signature);
```

This code snippet signs a message using the signer's private key.

### Verifying a Signature

```javascript
const isValid = signer.verify(message, signature);
console.log('Is the signature valid?', isValid);
```

This code verifies a signature against the original message.

## API Reference

### `InternalSigner`

#### Methods:

  - **`static generate(): InternalSigner`**

      - Generates a new ED25519 key pair.
      - Returns: An instance of the `InternalSigner` class.

  - **`constructor(privateKey: PrivateKey | string)`**

      - Initializes the signer with an existing ED25519 private key.
      - `privateKey`:  A `PrivateKey` object from the `@hashgraph/sdk` or a DER-encoded private key string.
      - Throws an error if the provided key is not a valid DER-encoded ED25519 key.

  - **`publicKey(): string`**

      - Retrieves the DER-formatted public key.
      - Returns: The public key as a DER-encoded string.

  - **`sign(message: Buffer): Uint8Array`**

      - Signs a message using the private key.
      - `message`: The message to sign as a `Buffer`.
      - Returns: The signature as a `Uint8Array`.

  - **`verify(message: Buffer, signature: Uint8Array): boolean`**

      - Verifies a signature against the provided message.
      - `message`: The original message as a `Buffer`.
      - `signature`: The signature to verify as a `Uint8Array`.
      - Returns: `true` if the signature is valid; otherwise, `false`.

## Error Handling

The `InternalSigner` class throws errors for the following conditions:

  - **Invalid Key**:  If the provided private key is not a valid DER-encoded ED25519 key.

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