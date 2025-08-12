# @hiero-did-sdk/anoncreds

This package provides implementation of Hedera AnonCreds Registry, following [Hedera AnonCreds Method specification](https://hiero-ledger.github.io/hedera-anoncreds-method/).
It enables the management of AnonCreds resources using Hedera Consensus Service (HCS) as Verifiable Data Registry (VDR) with support for revocation.

## Features

- AnonCreds VDR: Register and resolve AnonCreds objects using HCS as highly-performant and cost-effective VDR.
- Revocation Support: Comprehensive support for AnonCreds revocation through effective approach for revocation registry management.
- TypeScript Support: Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/anoncreds
```

## Usage

Learn how to manage anoncreds registry on the Hedera network in the [Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/anoncreds-guide.html).
For more detailed examples and usage scenarios, refer to the [AnonCreds Package Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/anoncreds-guide.html).

## API Reference

See detailed API specifications and available methods in the [API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/anoncreds-api.html).


## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hiero DID SDK](https://github.com/hiero-ledger/hiero-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.
- [Hedera AnonCreds Method](https://hiero-ledger.github.io/hedera-anoncreds-method/) - The specification for Hedera AnonCreds Method implemented in thus package.
- [Hedera Consensus Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service) - Documentation for the Hedera Consensus Service used by this package.
