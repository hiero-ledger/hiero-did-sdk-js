# Hashgraph DID SDK Examples

## Overview

This directory contains example implementations demonstrating the usage of the Hedera Decentralized Identifier (DID) SDK. These examples showcase various functionalities of the SDK, such as creating DIDs, updating DID documents, resolving DIDs, and managing keys.

## Prerequisites

- Hashgraph DID SDK: Make sure you have the Hashgraph DID SDK installed in your project.
- Node.js: Ensure you have Node.js (version 18 or higher) installed on your system.
- Hedera Testnet Account: You'll need a Hedera account on the testnet with some hbars to pay for transaction fees.

## Examples

The following examples are available in this directory:

### resolveDID

*   **[`resolveDID-as-json-ld.ts`](./resolveDID-as-json-ld.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document in JSON-LD format.
*   **[`resolveDID-as-json.ts`](./resolveDID-as-json.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document in JSON format.
*   **[`resolveDID-with-full-metadata.ts`](./resolveDID-with-full-metadata.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document with full DID Resolution metadata.

### createDID

*   **[`createDID-with-client-options.ts`](./createDID-with-client-options.ts)**: Demonstrates how to create a DID with custom `client-options`.
*   **[`createDID-with-a-client.ts`](./createDID-with-a-client.ts)**:  Shows how to create a DID using a pre-configured Hedera `client` instance.
*   **[`createDID-with-a-custom-controller.ts`](./createDID-with-a-custom-controller.ts)**:  Demonstrates how to create a DID with a custom `controller`.
*   **[`createDID-with-a-topic-specific-did.ts`](./createDID-with-a-topic-specific-did.ts)**:  Shows how to create a DID associated with a specific Hedera topic ID.

### updateDID

*   **[`updateDID-with-client-options.ts`](./updateDID-with-client-options.ts)**: Demonstrates how to update a DID with custom `client-options`.
*   **[`updateDID-with-a-client.ts`](./updateDID-with-a-client.ts)**: Shows how to update a DID using a pre-configured Hedera `client` instance.
*   **[`updateDID-with-multiple-properties.ts`](./updateDID-with-multiple-properties.ts)**: Demonstrates how to update multiple properties of a DID document simultaneously.
*   **[`updateDID-with-DID-update-builder.ts`](./updateDID-with-DID-update-builder.ts)**: Demonstrates how to use the `DIDUpdateBuilder` class to construct and execute DID update operations.

### deactivateDID

*   **[`deactivateDID-with-client-options.ts`](./deactivateDID-with-client-options.ts)**: Demonstrates how to deactivate a DID with custom `client-options`.
*   **[`deactivateDID-with-a-client.ts`](./deactivateDID-with-a-client.ts)**: Shows how to deactivate a DID using a pre-configured Hedera `client` instance.

## Running the Examples

To run the examples, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    *   Copy the `.env.template` file to `.env`.
    *   Store your Hedera testnet account ID and private key in the `.env` file:

        ```bash
        HEDERA_TESTNET_ACCOUNT_ID=0.0.your-account-id
        HEDERA_TESTNET_PRIVATE_KEY=your-private-key
        ```

3.  **Run an example:**

    ```bash
    npm run examples:run -- examples/<<example-filename>>
    ```

    Where `<<example-filename>>` is the filename of the example you want to run (e.g., `createDID-with-client-options.ts`).

**Note:** Make sure to replace the placeholder values in the examples and the `.env` file with your actual Hedera account details and desired configuration.