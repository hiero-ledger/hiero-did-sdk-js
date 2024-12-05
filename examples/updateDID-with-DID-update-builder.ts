/*
 * This example demonstrates how to use the `DIDUpdateBuilder` class
 * to construct and execute DID update operations.
 */
import { updateDID } from "@swiss-digital-assets-institute/registrar";
import { DIDUpdateBuilder } from "@swiss-digital-assets-institute/registrar";
import { Client } from "@hashgraph/sdk";

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

const did = "did:hedera:testnet:RTHEmJFVw6fPPkUuFhL5f8j8ShFrVvtUcZuVq3k2pWR_0.0.5217512"; // Replace with the DID you want to update

async function main() {
  try {
    const builder = new DIDUpdateBuilder(did)
      .addVerificationMethod({
        id: `${did}#key-1`,
        controller: did,
        publicKeyMultibase: "z6MkkFf6yboMwr1LQVAHqatuGYD9foRe7L2wPkEn1A7LyoQb",
        type: "Ed25519VerificationKey2020",
      })
      .addService({
        id: `${did}#service-1`,
        type: "VerifiableCredentialService",
        serviceEndpoint: "https://example.com/vc/",
      })
      .build();

    const { did: updatedDID, didDocument } = await updateDID({
      did,
      updates: builder,
    }, { client });

    console.log(`Updated DID: ${updatedDID}`);
    console.log(`Updated DID Document: ${JSON.stringify(didDocument, null, 2)}`);
  } catch (error) {
    console.error("Error updating DID:", error);
  }
}

main();