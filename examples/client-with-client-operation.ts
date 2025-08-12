/*
 * This example demonstrates how to use the `withClient` method of HederaClientService
 * to perform an asynchronous operation with automatic client creation and proper disposal.
 *
 * The sample operation here gets the account balance for the operator account.
 */
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { AccountBalanceQuery } from '@hashgraph/sdk';

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const config = {
  networks: [
    {
      network: 'testnet',
      operatorId,
      operatorKey
    },
  ],
} satisfies HederaClientConfiguration;

async function main() {
  const clientService = new HederaClientService(config);

  try {
    const balance = await clientService.withClient({ networkName: 'testnet' }, async (client) => {
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(client.getOperator().accountId)
        .execute(client);
      return accountBalance.hbars.toString();
    });

    console.log('Operator account balance:', balance);
  } catch (error) {
    console.error('Error during operation with Hedera client:', error);
  }
}

main();
