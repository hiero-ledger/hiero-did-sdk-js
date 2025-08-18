/*
 * This example demonstrates how to resolve and retrieve a file from HCS using the `resolveFile` method.
 * It fetches the file content from the given topic ID, validates the memo and checksum,
 * and decompresses the content to restore the original file buffer.
 */
import { HcsFileService } from '@hiero-did-sdk/hcs';
import { HederaClientConfiguration, HederaClientService } from '@hiero-did-sdk/client';
import { PrivateKey } from '@hashgraph/sdk';

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

  const hcsFileService = new HcsFileService(client, { maxSize: 100 });

  try {
    const content = 'It is the file content!';

    // Submit file
    console.log(`File submitting...`);
    const fileTopicId = await hcsFileService.submitFile({
      payload: Buffer.from(content),
      submitKey: PrivateKey.generate(),
      waitForChangesVisibility: true,
    });
    console.log(`File submitted (topicId = ${fileTopicId})`);

    console.log(`File resolving...`);
    const fileBuffer = await hcsFileService.resolveFile({ topicId: fileTopicId });
    console.log('File resolved successfully, size:', fileBuffer.length);
    console.log('File resolved successfully, content:', fileBuffer.toString());
  } catch (error) {
    console.error('Error submitting message:', error);
  }
}

main().catch(console.error);
