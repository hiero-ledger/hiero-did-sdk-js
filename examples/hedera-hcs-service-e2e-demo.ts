/*
 * This E2E demo demonstrates how to use the HederaHcsService
 * to create and manage topics, submit and read messages, and upload and
 * retrieve files in the Hedera Consensus Service (HCS).
 *
 * It showcases the main capabilities wrapped via `HederaHcsService`,
 * including topic lifecycle operations, message publishing and querying,
 * as well as file submission and resolution.
 */

import { HederaHcsService } from '@hiero-did-sdk/hcs';
import { PrivateKey } from '@hashgraph/sdk';
import { HederaClientConfiguration } from '@hiero-did-sdk/client';

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
  const hcsService = new HederaHcsService(config);

  try {
    // 1. Create a new HCS topic
    const adminKey = PrivateKey.generateED25519();
    const submitKey = PrivateKey.generateED25519();

    const topicId = await hcsService.createTopic({
      networkName: 'testnet',
      topicMemo: 'My Comprehensive HCS Topic',
      adminKey,
      submitKey,
      waitForChangesVisibility: true,
      waitForChangesVisibilityTimeoutMs: 15000,
    });
    console.log('Step 1');
    console.log('Created topic ID:', topicId);
    console.log('');

    // 2. Get topic information
    const topicInfo = await hcsService.getTopicInfo({ topicId, networkName: 'testnet' });
    console.log('Step 2');
    console.log('Topic info:', topicInfo);
    console.log('');

    // 3. Update topic
    await hcsService.updateTopic({
      networkName: 'testnet',
      topicId,
      currentAdminKey: adminKey,
      topicMemo: 'Updated Memo for HCS Topic',
      waitForChangesVisibility: true,
    });
    console.log('Step 3');
    console.log('Topic updated successfully.');
    console.log('');

    // 4. Submit a message to the topic
    const message = 'Hello, Hedera HCS via HederaHcsService!';
    const submitResult = await hcsService.submitMessage({
      topicId,
      message,
      submitKey,
      networkName: 'testnet',
      waitForChangesVisibility: true,
      waitForChangesVisibilityTimeoutMs: 10000,
    });
    console.log('Step 4');
    console.log('Message submitted:', submitResult);
    console.log('');

    // 5. Retrieve messages from the topic
    const messages = await hcsService.getTopicMessages({
      topicId,
      limit: 10,
      networkName: 'testnet',
    });
    console.log('Step 5');
    console.log(`Got ${messages.length} messages from topic:`);
    messages.forEach((msg, idx) => {
      console.log(`${idx + 1}) [${msg.consensusTime.toISOString()}]: ${Buffer.from(msg.contents).toString('utf-8')}`);
    });
    console.log('');

    // 6. Submit a file to HCS
    const fileContent = Buffer.from('It is the file content!');
    const fileSubmitKey = PrivateKey.generateED25519();
    const fileTopicId = await hcsService.submitFile({
      payload: fileContent,
      submitKey: fileSubmitKey,
      networkName: 'testnet',
      waitForChangesVisibility: true,
      waitForChangesVisibilityTimeoutMs: 30000,
    });
    console.log('Step 6');
    console.log('File submitted to topic ID:', fileTopicId);
    console.log('');

    // 7. Resolve the file from HCS
    const resolvedFile = await hcsService.resolveFile({ topicId: fileTopicId, networkName: 'testnet' });
    console.log('Step 7');
    console.log('Resolved file size (bytes):', resolvedFile.length);
    console.log('Resolved file content (string):', resolvedFile.toString());
    console.log('');

    // 8. Delete topic
    await hcsService.deleteTopic({
      networkName: 'testnet',
      topicId,
      currentAdminKey: adminKey,
      waitForChangesVisibility: true,
    });
    console.log('Step 8');
    console.log('Topic deleted successfully.');
    console.log('');
  } catch (error) {
    console.error('Error using HederaHcsService:', error);
  }
}

main().catch(console.error);
