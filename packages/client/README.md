# @hiero-did-sdk/client

This package provides a flexible and configurable approach to managing Hedera SDK Clients with different network configurations.

## Features

- **Hedera Client Management:** Simplifies the creation and configuration of Hedera clients.
- **Multi-Network Support:** Configure and manage clients for multiple Hedera networks simultaneously.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/client
```

## Usage

Learn how to use the HederaClientService in the [Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/client-guide.html).

### Examples

- [get-client](../../examples/client-get-client.ts) - Demonstrates how to create a Hedera client instance for a specific network.
- [with-client-operation](../../examples/client-with-client-operation.ts) - Demonstrates usage of `withClient` to safely perform operations with automatic client lifecycle management.

## API Reference

See detailed API specifications and available methods in the [API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/client-api.html).

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
