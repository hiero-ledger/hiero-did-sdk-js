/*
 * This example demonstrates how to submit a file to HCS using the `submitFile` method.
 * The file content is chunked, compressed, and published on a newly created HCS topic
 * with an HCS-1 compliant memo. Optionally, the submission waits until the file is visible in the network.
 */
import { HcsFileService } from '@hiero-did-sdk/hcs';
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

  const hcsFileService = new HcsFileService(client, { maxSize: 100 });

  try {
    const content = 'It is the file content!';
    const fileTopicId = await hcsFileService.submitFile({
      payload: Buffer.from(content),
      waitForChangesVisibility: true,
    });
    console.log('File submitted successfully to topic:', fileTopicId);
  } catch (error) {
    console.error('Error submitting message:', error);
  }
}

main().catch(console.error);
