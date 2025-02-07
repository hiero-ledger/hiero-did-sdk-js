# @hashgraph-did-sdk/publisher-internal

This package provides the `Publisher` class, a core component of the Hashgraph DID SDK. It offers a standardized way to submit and execute transactions on the Hedera network, simplifying the process of interacting with the Hedera Consensus Service (HCS). The `Publisher` class adheres to the `Publisher` interface, ensuring consistency and interoperability within the Hedera DID ecosystem.

## Features

- **Transaction Submission:** Submits transactions to the Hedera network for DID operations.
- **Transaction Execution:** Executes transactions on the Hedera network, ensuring reliable processing.
- **Network Interaction:** Provides a streamlined interface for interacting with the Hedera network.
- **Network Detection:** Automatically detects the Hedera network environment (mainnet, testnet).
- **Error Handling:** Includes robust error handling for transaction failures and network issues.
- **Extensibility:** Designed for extensibility to support future Hedera network features.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and type safety.

## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/publisher-internal
```

## Usage

Learn how to use the `Publisher` class to submit transactions to the Hedera network in the [Publisher Guide](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/publisher-guide.html).

## API Reference

Learn more in the [`Publisher` API Reference](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/publisher-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.
