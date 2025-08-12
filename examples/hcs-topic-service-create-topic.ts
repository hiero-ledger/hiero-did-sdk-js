/*
 * This example demonstrates how to create a new HCS topic using the `createTopic` method.
 * It shows configuration of optional parameters such as topic memo, submit key, admin key,
 * auto-renewal settings, and waiting for the topic to become visible.
 */
import { HcsTopicService } from '@hiero-did-sdk/hcs';
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

async function main() {
  const clientService = new HederaClientService(config);
  const client = clientService.getClient('testnet');

  const topicService = new HcsTopicService(client, { maxSize: 100 });

  try {
    const topicId = await topicService.createTopic({
      topicMemo: 'Example HCS Topic',
      waitForChangesVisibility: true,
    });
    console.log('Created topic ID:', topicId);
  } catch (error) {
    console.error('Error creating topic:', error);
  }
}

main().catch(console.error);
