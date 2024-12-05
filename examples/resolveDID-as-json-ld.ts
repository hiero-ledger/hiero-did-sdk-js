/*
 * This example demonstrates how to resolve a DID and retrieve its
 * corresponding DID Document in JSON-LD format using the `resolveDID`
 * function.
 */
import { resolveDID } from "@swiss-digital-assets-institute/resolver";

const did = "did:hedera:testnet:23g2MabDNq3KyB7oeH9yYZsJTRVeQ24DqX8o6scB98e3_0.0.5217215";

async function main() {
  try {
    const didDocument = await resolveDID(did);
    console.log(didDocument);
  } catch (error) {
    console.error("Error resolving DID:", error);
  }
}

main();