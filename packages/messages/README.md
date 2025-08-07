# @hiero-did-sdk/messages

This package provides a comprehensive set of classes for constructing and handling DID Messages within the Hiero DID SDK. These DID Messages facilitate various DID operations on the Hedera network, such as creating, updating, and deactivating DIDs, as well as managing their associated keys and services.

## Features

- **DID Message Classes:** Offers a variety of DID Message classes for different DID operations.
- **Serialization and Deserialization:** Provides methods for serializing DID Messages to byte arrays and deserializing them back into DID Message objects.
- **Lifecycle Integration:** Seamlessly integrates with the `@hiero-did-sdk/lifecycle` package to define and execute DID Message lifecycles.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and type safety.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/messages
```

## Usage

Learn how to use the DID Message classes to construct and handle DID Messages for various DID operations in the [Messages Guide](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/messages-guide.html).

## API Reference

Learn more in the [Messages API Reference](https://github.com/hiero-ledger/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/messages-api.html).

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
