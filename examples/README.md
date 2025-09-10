# Hiero DID SDK Examples

## Overview

This directory contains example implementations demonstrating the usage of the SDK. These examples showcase various functionalities of the SDK, such as creating DIDs, updating DID documents, resolving DIDs, and managing keys.

## Prerequisites

- Hiero DID SDK: Make sure you have the Hiero DID SDK installed in your project.
- Node.js: Ensure you have Node.js (version 20 or higher) installed on your system.
- Hedera Testnet Account: You'll need a Hedera account on the testnet with some hbars to pay for transaction fees.

## E2E Demos
- **[`did-e2e-demo.ts`](./did-e2e-demo.ts)**: Demonstrates how to create, update, and deactivate a DID. Provides basic interactivity (steps confirmation and user input for DID service endpoint).
- **[`anoncreds-e2e-demo.ts`](./anoncreds-e2e-demo.ts)**: Demonstrates how manage AnonCreds resources on Hedera — create Schema and Credential Definition, create and update Revocation Registry.
- **[`hedera-hcs-service-e2e-demo.ts`](./hedera-hcs-service-e2e-demo.ts)**: Demonstrates how to use the HederaHcsService to create and manage topics, submit and read messages, and upload and retrieve files using Hedera Consensus Service (HCS).

## Examples

The following examples are available in this directory:

### Resolver package

#### resolveDID

- **[`resolveDID-as-cbor.ts`](./resolveDID-as-cbor.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document in CBOR format.
- **[`resolveDID-as-json-ld.ts`](./resolveDID-as-json-ld.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document in JSON-LD format.
- **[`resolveDID-as-json.ts`](./resolveDID-as-json.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document in JSON format.
- **[`resolveDID-with-full-metadata.ts`](./resolveDID-with-full-metadata.ts)**: Demonstrates how to resolve a DID and retrieve its corresponding DID Document with full DID Resolution metadata.
- **[`resolveDID-with-topic-reader.ts`](./resolveDID-with-topic-reader.ts)**: Demonstrates how to resolve a DID using a custom topic reader.
- **[`resolveDID-with-hcs-topic-reader.ts`](./resolveDID-with-topic-reader.ts)**: Demonstrates how to resolve a DID using a HCS Topic Reader from resolver package.
- **[`resolveDID-with-rest-api-topic-reader.ts`](./resolveDID-with-rest-api-topic-reader.ts)**: Demonstrates how to resolve a DID using a Hedera REST API Topic Reader from resolver package.
- **[`resolveDID-with-verifier.ts`](./resolveDID-with-verifier.ts)**: Demonstrates how to resolve a DID using a custom verifier.

#### dereferenceDID

- **[`dereferenceDID-fragment.ts`](./dereferenceDID-fragment.ts)**: Demonstrates how to dereference a fragment from a DID document.
- **[`dereferenceDID-service-endpoint.ts`](./dereferenceDID-service-endpoint.ts)**: Demonstrates how to dereference a service endpoint from a DID document.
- **[`dereferenceDID-with-full-metadata.ts`](./dereferenceDID-with-full-metadata.ts)**: Demonstrates how to dereference a DID fragment with full DID Resolution metadata.
- **[`dereferenceDID-with-topic-reader.ts`](./dereferenceDID-with-topic-reader.ts)**: Demonstrates how to dereference a DID fragment using a custom topic reader.
- **[`dereferenceDID-with-verifier.ts`](./dereferenceDID-with-verifier.ts)**: Demonstrates how to dereference a DID fragment using a custom verifier.

### Registrar package

#### createDID

- **[`createDID-with-client-options.ts`](./createDID-with-client-options.ts)**: Demonstrates how to create a DID with custom `client-options`.
- **[`createDID-with-a-client.ts`](./createDID-with-a-client.ts)**: Shows how to create a DID using a pre-configured Hedera `client` instance.
- **[`createDID-with-a-custom-controller.ts`](./createDID-with-a-custom-controller.ts)**: Demonstrates how to create a DID with a custom `controller`.
- **[`createDID-with-a-topic-specific-did.ts`](./createDID-with-a-topic-specific-did.ts)**: Shows how to create a DID associated with a specific Hedera topic ID.
- **[`createDID-using-client-secret-mode.ts`](./createDID-using-client-secret-mode.ts)**: Shows how to create a DID in a Client Managed Secret Mode.

#### updateDID

- **[`updateDID-with-client-options.ts`](./updateDID-with-client-options.ts)**: Demonstrates how to update a DID with custom `client-options`.
- **[`updateDID-with-a-client.ts`](./updateDID-with-a-client.ts)**: Shows how to update a DID using a pre-configured Hedera `client` instance.
- **[`updateDID-with-multiple-properties.ts`](./updateDID-with-multiple-properties.ts)**: Demonstrates how to update multiple properties of a DID document simultaneously.
- **[`updateDID-with-DID-update-builder.ts`](./updateDID-with-DID-update-builder.ts)**: Demonstrates how to use the `DIDUpdateBuilder` class to construct and execute DID update operations.
- **[`updateDID-using-client-secret-mode.ts`](./updateDID-using-client-secret-mode.ts)**: Demonstrates how to update a DID in a Client Managed Secret Mode.

#### deactivateDID

- **[`deactivateDID-with-client-options.ts`](./deactivateDID-with-client-options.ts)**: Demonstrates how to deactivate a DID with custom `client-options`.
- **[`deactivateDID-with-a-client.ts`](./deactivateDID-with-a-client.ts)**: Shows how to deactivate a DID using a pre-configured Hedera `client` instance.
- **[`deactivateDID-using-client-secret-mode.ts`](./deactivateDID-using-client-secret-mode.ts)**: Demonstrates how to deactivate a DID in a Client Managed Secret Mode.


### HCS package

#### hcsService

- **[`hedara-hcs-service-comprehensive-example.ts`](./hedara-hcs-service-comprehensive-example.ts)**: Comprehensive example demonstrating creation, update, info retrieval of HCS topic, message submission and retrieval, file submission and resolution using `HederaHcsService`.

#### HcsTopicService

- **[`hcs-topic-service-create-topic.ts`](./hcs-topic-service-create-topic.ts)**: Demonstrates how to create a new Hedera Consensus Service (HCS) topic using `HcsTopicService.createTopic`.
- **[`hcs-topic-service-update-topic.ts`](./hcs-topic-service-update-topic.ts)**: Demonstrates how to update an existing HCS topic using `HcsTopicService.updateTopic`.
- **[`hcs-topic-service-delete-topic.ts`](./hcs-topic-service-delete-topic.ts)**: Demonstrates how to delete an HCS topic using `HcsTopicService.deleteTopic`.
- **[`hcs-topic-service-get-topic-info.ts`](./hcs-topic-service-get-topic-info.ts)**: Demonstrates how to retrieve information about an HCS topic using `HcsTopicService.getTopicInfo`.

#### hcsMessageService

- **[`hcs-message-service-submit-message.ts`](./hcs-message-service-submit-message.ts)**: Demonstrates how to submit a message to a Hedera Consensus Service (HCS) topic using `HcsMessageService.submitMessage`.
- **[`hcs-message-service-get-topic-messages.ts`](./hcs-message-service-get-topic-messages.ts)**: Demonstrates how to retrieve messages from an HCS topic using `HcsMessageService.getTopicMessages`.

#### hcsFileService

- **[`hcs-file-service-submit-file.ts`](./hcs-file-service-submit-file.ts)**: Demonstrates how to submit a file to Hedera Consensus Service (HCS) using `HcsFileService.submitFile`.
- **[`hcs-file-service-resolve-file.ts`](./hcs-file-service-resolve-file.ts)**: Demonstrates how to resolve and retrieve a file from HCS using `HcsFileService.resolveFile`.

### HederaAnoncredsRegistry package

- **[`anoncreds-register-schema.ts`](./anoncreds-register-schema.ts)**: Demonstrates how to register a schema using `HederaAnoncredsRegistry.registerSchema`.
- **[`anoncreds-get-schema.ts`](./anoncreds-get-schema.ts)**: Demonstrates how to retrieve a registered schema using `HederaAnoncredsRegistry.getSchema`.
- **[`anoncreds-register-credential-definition.ts`](./anoncreds-register-credential-definition.ts)**: Demonstrates how to register a credential definition with `HederaAnoncredsRegistry.registerCredentialDefinition`.
- **[`anoncreds-get-credential-definition.ts`](./anoncreds-get-credential-definition.ts)**: Demonstrates how to obtain a credential definition using `HederaAnoncredsRegistry.getCredentialDefinition`.
- **[`anoncreds-register-revocation-registry.ts`](./anoncreds-register-revocation-registry.ts)**: Demonstrates how to register a revocation registry definition via `HederaAnoncredsRegistry.registerRevocationRegistryDefinition`.
- **[`anoncreds-get-revocation-registry.ts`](./anoncreds-get-revocation-registry.ts)**: Demonstrates how to fetch a revocation registry definition using `HederaAnoncredsRegistry.getRevocationRegistryDefinition`.
- **[`anoncreds-register-revocation-status-list.ts`](./anoncreds-register-revocation-status-list.ts)**: Demonstrates how to register a revocation status list using `HederaAnoncredsRegistry.registerRevocationStatusList`.
- **[`anoncreds-get-revocation-status-list.ts`](./anoncreds-get-revocation-status-list.ts)**: Demonstrates how to get a revocation status list with `HederaAnoncredsRegistry.getRevocationStatusList`.

### HederaClientService package

- **[`get-client.ts`](./client-get-client.ts)**: Demonstrates how to create a Hedera client instance for a specific network using `HederaClientService.getClient`.
- **[`with-client-operation.ts`](./client-with-client-operation.ts)**: Demonstrates usage of `HederaClientService.withClient` to safely perform operations with automatic client lifecycle management.

### LRUMemoryCache package

- **[`cache-set-get.ts`](./cache-set-get.ts)**: Demonstrates how to set, get, and remove cache entries using `LRUMemoryCache`.
- **[`cache-expiry-cleanup.ts`](./cache-expiry-cleanup.ts)**: Demonstrates how to use expiration for cache entries and clean up expired items.
- **[`cache-clear-getall.ts`](./cache-clear-getall.ts)**: Demonstrates how to clear the cache and retrieve all current cache entries.

### Crypto package

- **[`crypto-sha256-string.ts`](./crypto-sha256-string.ts)**: Demonstrates how to compute the SHA-256 hash of a string using the `Crypto.sha256` method.
- **[`crypto-sha256-uint8array.ts`](./crypto-sha256-uint8array.ts)**: Demonstrates how to compute the SHA-256 hash of a Uint8Array using the `Crypto.sha256` method.

### Zstd package

- **[`zstd-compress.ts`](./zstd-compress.ts)**: Demonstrates how to compress a Uint8Array using the `Zstd.compress` static method.
- **[`zstd-decompress.ts`](./zstd-decompress.ts)**: Demonstrates how to decompress a Uint8Array using the `Zstd.decompress` static method.


## Running the Examples

To run the examples, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    - Copy the `.env.template` file to `.env`.
    - Store your Hedera testnet account ID and private key in the `.env` file:

      ```bash
      HEDERA_TESTNET_OPERATOR_ID=0.0.your-account-id
      HEDERA_TESTNET_OPERATOR_KEY=your-private-key
      ```

3.  **Run an example:**

    ```bash
    npm run examples:run -- examples/<<example-filename>>
    ```

    Where `<<example-filename>>` is the filename of the example you want to run (e.g., `createDID-with-client-options.ts`).

**Note:** Make sure to replace the placeholder values in the examples and the `.env` file with your actual Hedera account details and desired configuration.
