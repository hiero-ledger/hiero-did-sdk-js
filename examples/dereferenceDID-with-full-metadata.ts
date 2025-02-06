/*
 * This example demonstrates how to dereference a DID URL and retrieve
 * the corresponding verification method resolution with full metadata.
 */
import { dereferenceDID } from '@swiss-digital-assets-institute/resolver';

const didUrl =
  'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215#did-root-key';

async function main() {
  try {
    const verificationMethodResolution = await dereferenceDID(
      didUrl,
      'application/ld+json;profile="https://w3id.org/did-resolution"',
    );
    console.log(verificationMethodResolution);
  } catch (error) {
    console.error('Error dereferencing DID:', error);
  }
}

main();
