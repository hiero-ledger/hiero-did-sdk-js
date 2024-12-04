<p align="center">
  <img src="../docs/modules/ROOT/images/THA-logo.png" alt="THA Logo">  
</p>

<h1 align="center">Examples for Hashgraph DID SDK</h1>

## Overview

This directory contains example implementations demonstrating the usage of the Hedera Decentralized Identifier (DID) SDK.

## Prerequisites

- Hashgraph DID SDK
- Node.js (version 18 or higher)
- Hedera Testnet Account

## Examples

- `create-did`: Demonstrates creating a new Decentralized Identifier

## Running the Examples

To run the examples, follow these steps:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set your Hedera Testnet account ID and private key in the `.env` file.

3. Run the example:

   ```bash
   npm run examples:run -- examples/<<example-name>>
   ```

   Where `<<example-name>>` is the name of the example you want to run, e.g. `create-did`.
   List of examples can be found above in the [Examples](#examples) section.

## Contributing

We welcome contributions to improve and expand these examples - simply fork the repository, add your example, and submit a Pull Request. Please ensure your example is well-documented and follows the project's coding standards.
