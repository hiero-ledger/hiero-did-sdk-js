/*
 * This example demonstrates how to resolve a DID and retrieve its
 * corresponding DID Document with full DID Resolution metadata using
 * the `resolveDID` function.
 */
import { resolveDID } from "@swiss-digital-assets-institute/resolver";

const did = "did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215";

async function main() {
  try {
    const didDocument = await resolveDID(
      did,
      'application/ld+json;profile="https://w3id.org/did-resolution"'
    );
    console.log(didDocument);
  } catch (error) {
    console.error("Error resolving DID:", error);
  }
}

main();