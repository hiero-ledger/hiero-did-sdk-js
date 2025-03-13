/*
 * This example demonstrates how to resolve a DID using a custom topic reader.
 * The custom topic reader is used to read the message from the Hedera network.
 */
import {
  resolveDID,
  TopicReaderHederaClient,
} from '@swiss-digital-assets-institute/resolver';

const did =
  'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215';

async function main() {
  try {
    const topicReader = new TopicReaderHederaClient();
    const didDocument = await resolveDID(did, 'application/did+ld+json', {
      topicReader,
    });
    console.log(didDocument);
  } catch (error) {
    console.error('Error resolving DID:', error);
  }
}

main();
