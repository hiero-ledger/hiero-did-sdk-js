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

Learn how to use:
- [HederaHcsService Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-service-guide.html)
- [HcsTopicService Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-topic-service-guide.html)
- [HcsMessageService Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-message-service-guide.html)
- [HcsFileService Usage Guide](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-file-service-guide.html)

## API Reference

See detailed API specifications and available methods here:
- [HederaHcsService API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-service-api.html).
- [HcsTopicService API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-topic-service-api.html)
- [HcsMessageService API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-message-service-api.html)
- [HcsFileService API Reference](https://hiero-ledger.github.io/hiero-did-sdk-js/documentation/latest/03-implementation/components/hcs-file-service-api.html)

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
