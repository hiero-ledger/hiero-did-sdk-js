/*
 * This example demonstrates how to retrieve messages from an HCS topic
 * using the `getTopicMessages` method of `HcsMessageService`.
 *
 * It demonstrates optional filtering by date, limit, and waiting for new messages.
 */
import { HcsMessageService, HcsTopicService } from '@hiero-did-sdk/hcs';
import { PrivateKey } from '@hashgraph/sdk';
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

  const hcsTopicService = new HcsTopicService(client);
  const hcsMessageService = new HcsMessageService(client);

  try {
    // Create topic
    console.log(`Topic creating...`);
    const topicId = await hcsTopicService.createTopic({
      topicMemo: 'Example Topic Memo',
    });
    console.log(`Topic created (topicId = ${topicId})`);

    // Submit message topic
    console.log(`Message submitting...`);
    const message = 'Hello, Hedera Consensus Service!';
    const submitKey = PrivateKey.generateED25519();
    await hcsMessageService.submitMessage({
      topicId,
      message,
      submitKey,
      waitForChangesVisibility: true
    });
    console.log(`Message submitted`);

    // Retrieving topic's messages
    console.log(`Messages retrieving...`);
    const messages = await hcsMessageService.getTopicMessages({
      topicId,
      limit: 10,
      maxWaitSeconds: 10,
    });
    console.log(`Retrieved ${messages.length} messages from topic ${topicId}:`);
    messages.forEach((msg, index) => {
      const content = Buffer.from(msg.contents).toString('utf-8');
      console.log(`${index + 1} - Time: ${msg.consensusTime.toISOString()} - Message: ${content}`);
    });
  } catch (error) {
    console.error('Error retrieving topic messages:', error);
  }
}

main().catch(console.error);
