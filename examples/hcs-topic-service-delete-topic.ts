/*
 * This example demonstrates how to delete an HCS topic using the `deleteTopic` method.
 * It shows signing the delete transaction with the current admin key and optionally
 * waiting for deletion confirmation on the mirror node.
 */
import { HcsTopicService } from '@hiero-did-sdk/hcs';
import { PrivateKey } from '@hashgraph/sdk';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';

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
  const client = clientService.getClient('testnet');

  const topicService = new HcsTopicService(client, { maxSize: 100 });

  const currentAdminKey = PrivateKey.fromStringDer(operatorKey);

  try {
    // Create topic
    console.log(`Topic creating...`);
    const topicId = await topicService.createTopic({
      topicMemo: 'Example Topic Memo',
      adminKey: currentAdminKey,
    });
    console.log(`Topic created (topicId = ${topicId})`);

    // Update topic
    console.log(`Topic deleting...`);
    await topicService.deleteTopic({
      topicId,
      currentAdminKey,
      waitForChangesVisibility: true
    });
    console.log('Topic deleted successfully');
  } catch (error) {
    console.error('Error deleting topic:', error);
  }
}

main().catch(console.error);
