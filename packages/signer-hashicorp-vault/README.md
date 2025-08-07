# @hiero-did-sdk/signer-hashicorp-vault

This package provides a way to create a `Signer` class that allows HashiCorp Vault to be used for secure key management and digital signature generation for Decentralized Identifiers (DIDs) using the ED25519 algorithm.

## Features

- **Key Management:** Create new Ed25519 keys or use existing ones stored in HashiCorp Vault for flexible key handling.
- **Signing and Verification:** Sign DID operations securely using Vault-managed Ed25519 keys.
- **Authentication:** Supports authentication via Vault tokens, user/password, and AppRole for secure access.
- **Security:** Keeps private keys inside Vault, ensuring strong protection and controlled access.
- **Vault Integration:** Seamlessly interacts with HashiCorp Vault for key storage, retrieval, and signing operations.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/signer-hashicorp-vault
```

## Usage

Learn how to use the `Signer` and `VaultSignerFactory` class to sign messages, and verify signatures in the [Vault Signer Guide](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/hashicorp-vault-signer-guide.html).

## API Reference

Learn more in the [`Signer` API Reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/hashicorp-vault-signer-api.html) and [`VaultSignerFactory` API Reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/hashicorp-vault-signer-factory-api.html).

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
