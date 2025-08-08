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

The package provides a `HederaClientService` class for managing Hedera clients:

```typescript
import { HederaClientService, HederaClientConfiguration } from '@hiero-did-sdk/client';
import { Client } from '@hashgraph/sdk';

// Configure the client service
const config: HederaClientConfiguration = {
  networks: [
    {
      network: 'testnet', // or 'mainnet', 'previewnet'
      operatorId: 'YOUR_OPERATOR_ID',
      operatorKey: 'YOUR_OPERATOR_PRIVATE_KEY'
    }
  ]
};

// Create a client service
const clientService = new HederaClientService(config);

// Get a client for a specific network
const client = clientService.getClient('testnet');

// Or use the withClient method to automatically handle client cleanup
await clientService.withClient({ networkName: 'testnet' }, async (client: Client) => {
  // Perform operations with the client
  // Client will be automatically closed when the operation completes
});
```

## API Reference

Learn more in the [Client API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/client-api.html).

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