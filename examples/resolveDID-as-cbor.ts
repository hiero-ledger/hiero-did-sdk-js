/*
 * This example demonstrates how to resolve a DID and retrieve its
 * corresponding DID Document as a CBOR encoded Uint8Array using the
 * `resolveDID` function.
 */
import { resolveDID } from '@hiero-did-sdk/resolver';

const did = 'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215';

async function main() {
  try {
    const didDocumentUintArray = await resolveDID(did, 'application/did+cbor');
    console.log(didDocumentUintArray);
  } catch (error) {
    console.error('Error resolving DID:', error);
  }
}

main();
