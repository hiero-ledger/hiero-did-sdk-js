/*
 * This example demonstrates how to dereference a DID URL and retrieve
 * the corresponding verification method using the `dereferenceDID`
 * function. You can use the `#` fragment to dereference a specific
 * verification method, verification relationship, or service.
 */
import { dereferenceDID } from '@hiero-did-sdk/resolver';

const didUrl =
  'did:hedera:testnet:3f3zxTz93CXnqhW3bNxqeyk8Gfk7v2yR27DRgSTYvHog_0.0.5278919?service=github&relativeRef=hiero-did-sdk-js';

async function main() {
  try {
    const serviceEndpoint = await dereferenceDID(
      didUrl,
      'application/ld+json;profile="https://w3id.org/did-resolution"'
    );
    console.log(serviceEndpoint);
  } catch (error) {
    console.error('Error dereferencing DID:', error);
  }
}

main();
