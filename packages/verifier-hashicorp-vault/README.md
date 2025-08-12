# @hiero-did-sdk/verifier-hashicorp-vault

This package provides a way to create a `Verifier` class that allows HashiCorp Vault to be used for secure key management and digital signature verification for Decentralized Identifiers (DIDs) using the ED25519 algorithm.

## Features

- **Key Management:** Use Ed25519 keys stored in HashiCorp Vault for flexible key handling.
- **Verification:** Verify DID operations securely using Vault-managed Ed25519 keys.
- **Authentication:** Supports authentication via Vault tokens, user/password, and AppRole for secure access.
- **Security:** Keeps private keys inside Vault, ensuring strong protection and controlled access.
- **Vault Integration:** Seamlessly interacts with HashiCorp Vault for key storage, retrieval, and verification operations.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/verifier-hashicorp-vault
```

## Usage

Learn how to use the `Verifier` and `VaultVerifierFactory` class to sign messages, and verify signatures in the [Vault Verifier Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hashicorp-vault-verifier-guide.html).

## API Reference

Learn more in the [`Verifier` API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hashicorp-vault-verifier-api.html) and [`VaultVerifierFactory` API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hashicorp-vault-verifier-factory-api.html).

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
