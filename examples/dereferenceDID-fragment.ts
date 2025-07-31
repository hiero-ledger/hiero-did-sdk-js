/*
 * This example demonstrates how to dereference a DID URL and retrieve
 * the corresponding verification method using the `dereferenceDID`
 * function. You can use the `#` fragment to dereference a specific
 * verification method, verification relationship, or service.
 */
import { dereferenceDID } from '@hiero-did-sdk/resolver';

const didUrl = 'did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215#did-root-key';

async function main() {
  try {
    const verificationMethod = await dereferenceDID(didUrl);
    console.log(verificationMethod);
  } catch (error) {
    console.error('Error dereferencing DID:', error);
  }
}

main();
