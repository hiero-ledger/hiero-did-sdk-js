/*
 * This example demonstrates how to get detailed information about an HCS topic
 * using the `getTopicInfo` method. If caching is configured in HcsTopicService,
 * it will use the cache; otherwise, it fetches directly from the network.
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
    // Specify the existing topicId on the testnet here
    const topicId = '0.0.6558113';
    const topicInfo = await topicService.getTopicInfo({ topicId });
    console.log('Topic info:', topicInfo);
  } catch (error) {
    console.error('Error fetching topic info:', error);
  }
}

main().catch(console.error);
