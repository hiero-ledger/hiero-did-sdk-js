# @hashgraph-did-sdk/signer-internal

This package provides the `Signer` class, a core component of the Hashgraph DID SDK. It enables secure key management and digital signature generation for Decentralized Identifiers (DIDs) using the ED25519 algorithm.  The `Signer` class adheres to the `Signer` interface, providing a standardized way to handle cryptographic operations within the Hedera DID ecosystem.

## Features

*   **Key Management:** Generate ED25519 key pairs or initialize from existing keys, providing flexibility in key management workflows.
*   **Signing and Verification:** Efficiently sign messages and verify signatures, ensuring data integrity and authenticity within your DID implementations.
*   **Compatibility:** Supports both raw and DER-formatted keys for seamless integration with different systems and libraries.
*   **Security:** Designed with security best practices to safeguard your private keys and ensure the reliability of signature operations.
*   **Hedera Network Support:** Supports DID creation on the Hedera mainnet and testnet.

## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/signer-internal
```

## Usage

Learn how to use the `Signer` class to generate key pairs, sign messages, and verify signatures in the [Signer Guide](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/signer-guide.html).

## API Reference

Learn more in the [`Signer` API Reference](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/signer-api.html).

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