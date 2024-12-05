# Hashgraph DID SDK Examples

## Overview

This directory contains example implementations demonstrating the usage of the Hedera Decentralized Identifier (DID) SDK. These examples showcase various functionalities of the SDK, such as creating DIDs, updating DID documents, resolving DIDs, and managing keys.

## Prerequisites

- Hashgraph DID SDK: Make sure you have the Hashgraph DID SDK installed in your project.
- Node.js: Ensure you have Node.js (version 18 or higher) installed on your system.
- Hedera Testnet Account: You'll need a Hedera account on the testnet with some hbars to pay for transaction fees.

## Examples

The following examples are available in this directory:

*   **[`createDID-with-client-options.ts`](./createDID-with-client-options.ts)**: Demonstrates how to create a DID with custom client options, such as network and account credentials.
*   **[`createDID-with-a-client.ts`](./createDID-with-a-client.ts)**:  Shows how to create a DID using a pre-configured Hedera `Client` instance.
*   **[`createDID-with-a-custom-controller.ts`](./createDID-with-a-custom-controller.ts)**:  Demonstrates how to create a DID with a custom controller DID.
*   **[`createDID-with-a-topic-specific-did.ts`](./createDID-with-a-topic-specific-did.ts)**:  Shows how to create a DID associated with a specific Hedera topic ID.

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