# @hashgraph-did-sdk/publisher-internal

This package delivers a publisher component, crucial for streamlined transaction management on the Hedera network. As part of the [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js), it provides a standardized implementation of the [Publisher](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components/publisher/guide.html) interface, simplifying transaction submission and execution for DID operations.


## Features

- **Simplified Transaction Submission:**  Provides a streamlined method for submitting any type of transaction to the Hedera network, abstracting away low-level details.
- **Automatic Network Detection:**  Intelligently detects the Hedera network (mainnet, testnet, previewnet) based on the provided client, simplifying configuration.
- **Error Handling:** Includes robust error handling to provide informative messages and facilitate debugging.
- **Extensible:** Designed for extensibility, allowing for future enhancements and adaptations to evolving Hedera network features.


## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/publisher-internal
```

## Usage

This package is intended for internal use within the `@hashgraph-did-sdk`. However, it can be used independently if needed.

### Importing the Package

```javascript
import { InternalPublisher } from '@hashgraph-did-sdk/publisher-internal';
```

This line imports the `InternalPublisher` class from the package.

### Initializing the Publisher

```javascript
import { Client } from '@hashgraph/sdk';

const client = Client.forTestnet(); // Or configure for mainnet/previewnet
const publisher = new InternalPublisher(client);
```

This code initializes the publisher with a Hedera Client.

### Publishing a Transaction

```javascript
import { Transaction } from '@hashgraph/sdk';

const transaction = new Transaction(...); // Create your transaction
const receipt = await publisher.publish(transaction);

console.log('Transaction Receipt:', receipt);
```

This code snippet publishes a transaction to the Hedera network and retrieves the receipt.

## API Reference

### `InternalPublisher`

#### Methods:

  - **`constructor(client: Client)`**

      - Initializes the publisher with a Hedera `Client`.
      - `client`:  A configured `Client` object from the `@hashgraph/sdk`.
      - Throws an error if the client is not provided or not configured correctly.

  - **`publish(transaction: Transaction): Promise<TransactionReceipt>`**

      - Publishes a transaction to the Hedera network.
      - `transaction`: The transaction to be executed.
      - Returns: A promise that resolves to the transaction receipt.

  - **`network(): string`**

      - Returns the name of the Hedera network being used (mainnet, testnet, previewnet).

  - **`publicKey(): PublicKey`**

      - Returns the public key of the operator account associated with the client.


## Error Handling

The `InternalPublisher` class throws errors for the following conditions:

  - **Invalid Client:** If the provided client is invalid or not configured correctly.
  - **Transaction Failure:** If the transaction fails to execute on the Hedera network.

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