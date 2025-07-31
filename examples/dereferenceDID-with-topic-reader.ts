/*
 * This example demonstrates how to dereference a DID URL using a custom topic reader.
 * The custom topic reader is used to read the message from the Hedera network.
 */
import { dereferenceDID, TopicReaderHederaClient } from '@hiero-did-sdk/resolver';

const didUrl = 'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215#did-root-key';

async function main() {
  try {
    const topicReader = new TopicReaderHederaClient();
    const verificationMethod = await dereferenceDID(didUrl, 'application/did+ld+json', {
      topicReader,
    });
    console.log(verificationMethod);
  } catch (error) {
    console.error('Error dereferencing DID:', error);
  }
}

main();
