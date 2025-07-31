/*
 * This example demonstrates how to dereference a DID URL using a custom verifier.
 * The custom verifier is used to verify the DID Document signature.
 */
import { dereferenceDID } from '@hiero-did-sdk/resolver';
import { Verifier } from '@hiero-did-sdk/verifier-internal';

const didUrl = 'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215#did-root-key';

async function main() {
  try {
    const verifier = Verifier.fromBase58('23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3');
    const verificationMethod = await dereferenceDID(didUrl, 'application/did+ld+json', {
      verifier,
    });
    console.log(verificationMethod);
  } catch (error) {
    console.error('Error dereferencing DID:', error);
  }
}

main();
