/*
 * This example demonstrates how to update an existing HCS topic using the `updateTopic` method.
 * It shows how to set new memo, submit and admin keys, auto-renew settings, expiration time,
 * and wait for update visibility on the mirror node.
 */
import { HcsTopicService } from '@hiero-did-sdk/hcs';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { PrivateKey } from '@hashgraph/sdk';

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
    console.log(`Topic updating...`);
    await topicService.updateTopic({
      topicId,
      currentAdminKey,
      topicMemo: `Updated topic memo - ${new Date().getTime()}`,
      waitForChangesVisibility: true,
    });
    console.log('Topic updated successfully');
  } catch (error) {
    console.error('Error updating topic:', error);
  }
}

main().catch(console.error);
