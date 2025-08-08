# @hiero-did-sdk/hcs

This package provides a comprehensive interface for interacting with Hedera Consensus Service (HCS) within the Hiero DID SDK JS.
It offers a set of services for managing topics, submitting and retrieving messages, and handling files through HCS.

## Features

- **HCS Topics Management:** Provides capabilities for creating, updating and deleing HCS Topics.
- **HCS Messages Management:** Submit and retrieve HCS messages.
- **HCS-1 standard support:** Submit and retrieve files using HCS as a storage layer according to HCS-1 Standard.
- **Caching Support:** Improve performance with optional caching of HCS messages and Topics info.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/hcs
```

## Usage

The package provides a `HederaHcsService` class for interacting with Hedera Consensus Service:

```typescript
import { HederaHcsService, HederaHcsServiceConfiguration } from '@hiero-did-sdk/hcs';

// Configure the HCS service
const config: HederaHcsServiceConfiguration = {
  networks: [
    {
      network: 'testnet', // or 'mainnet', 'previewnet'
      operatorId: 'YOUR_OPERATOR_ID',
      operatorKey: 'YOUR_OPERATOR_PRIVATE_KEY'
    }
  ],
  // Optional cache configuration
  cache: {
    maxSize: 1000
  }
};

// Create an HCS service
const hcsService = new HederaHcsService(config);

// Create a topic
const topicResult = await hcsService.createTopic({
  networkName: 'testnet',
  memo: 'My topic description'
});
const topicId = topicResult.topicId;

// Submit a message to a topic
const messageResult = await hcsService.submitMessage({
  networkName: 'testnet',
  topicId,
  message: 'Hello, Hedera Consensus Service!'
});

// Get messages from a topic
const messages = await hcsService.getTopicMessages({
  networkName: 'testnet',
  topicId
});

// Submit a file
const fileId = await hcsService.submitFile({
  networkName: 'testnet',
  file: Buffer.from('File content'),
  topicId
});

// Resolve a file
const fileContent = await hcsService.resolveFile({
  networkName: 'testnet',
  fileId
});
```

## API Reference

Learn more in the [HCS API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/0.1.0/03-implementation/components/hcs-api.html).

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
- [Hedera Consensus Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service) - Documentation for the Hedera Consensus Service used by this package.