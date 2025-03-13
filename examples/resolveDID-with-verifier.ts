/*
 * This example demonstrates how to resolve a DID using a custom verifier.
 * The custom verifier is used to verify the DID Document signature.
 */
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { Verifier } from '@swiss-digital-assets-institute/verifier-internal';

const did =
  'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215';

async function main() {
  try {
    const verifier = Verifier.fromBase58(
      '23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3',
    );
    const didDocument = await resolveDID(did, 'application/did+ld+json', {
      verifier,
    });
    console.log(didDocument);
  } catch (error) {
    console.error('Error resolving DID:', error);
  }
}

main();
