/*
 * This example demonstrates how to resolve a DID using a Hedera HCS Topic Reader.
 */
import { resolveDID, TopicReaderHederaHcs } from '@hiero-did-sdk/resolver';
import { HederaHcsServiceConfiguration } from '@hiero-did-sdk/hcs';

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const did = 'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215';

async function main() {
  try {
    const config: HederaHcsServiceConfiguration = {
      networks: [{ network: 'testnet', operatorId, operatorKey }],
    };
    const topicReader = new TopicReaderHederaHcs(config);
    const didDocument = await resolveDID(did, 'application/did+ld+json', {
      topicReader,
    });
    console.log(didDocument);
  } catch (error) {
    console.error('Error resolving DID:', error);
  }
}

main();
