/*
 * This example demonstrates how to submit a message to an HCS topic
 * using the `submitMessage` method of `HcsMessageService`.
 *
 * It shows optional signing with a private key and waiting
 * for visibility confirmation of the message.
 */
import { HcsMessageService, HcsTopicService } from '@hiero-did-sdk/hcs';
import { PrivateKey } from '@hashgraph/sdk';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { Signer } from '@hiero-did-sdk/signer-internal';

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const config: HederaClientConfiguration = {
  networks: [
    {
      network: 'testnet',
      operatorId,
      operatorKey,
    },
  ],
};

async function main() {
  const clientService = new HederaClientService(config);
  const client = clientService.getClient('testnet');

  const hcsTopicService = new HcsTopicService(client, { maxSize: 100 });
  const hcsMessageService = new HcsMessageService(client, { maxSize: 100 });

  try {
    // Create topic
    console.log(`Topic creating...`);
    const topicId = await hcsTopicService.createTopic({
      topicMemo: 'Example Topic Memo',
    });
    console.log(`Topic created (topicId = ${topicId})`);

    // Submit topic's message
    console.log(`Message submitting...`);
    const message = 'Hello, Hedera Consensus Service!';
    const submitKey = PrivateKey.generateED25519();
    const result = await hcsMessageService.submitMessage({
      topicId,
      message,
      submitKeySigner: new Signer(submitKey),
      waitForChangesVisibility: true,
    });
    console.log('Message submitted successfully:');
    console.log('Node ID:', result.nodeId);
    console.log('Transaction ID:', result.transactionId);
    console.log('Transaction Hash:', Buffer.from(result.transactionHash).toString('hex'));
  } catch (error) {
    console.error('Error submitting message:', error);
  }
}

main().catch(console.error);
