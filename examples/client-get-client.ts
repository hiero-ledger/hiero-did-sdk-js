/*
 * This example demonstrates how to instantiate HederaClientService with network configurations
 * and get a Hedera client instance for the specified network.
 *
 * It shows usage of the `getClient` method to retrieve a client configured with operator credentials,
 * ready to be used for blockchain operations.
 */
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const config: HederaClientConfiguration = {
  networks: [
    {
      network: 'testnet',
      operatorId,
      operatorKey
    },
  ],
};

function main() {
  try {
    const clientService = new HederaClientService(config);
    const client = clientService.getClient('testnet');

    // Example: get network name
    console.log('Connected to ledger:', client.ledgerId.toString());

    // Close client connection when done
    client.close();
  } catch (error) {
    console.error('Error creating Hedera client:', error);
  }
}

main();
