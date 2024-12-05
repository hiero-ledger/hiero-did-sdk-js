/* 
  This example demonstrates how to create a DID with a 
  topic-specific DID. This means that the DID will be 
  associated with a specific Hedera topic ID, which can 
  be useful for managing permissions and access control.
*/
import { Client } from "@hashgraph/sdk";
import { createDID } from '@swiss-digital-assets-institute/registrar';

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

async function main() {
  try {
    const { did, didDocument } = await createDID({
      topicId: "0.0.5217514",
    },{
      client
    });

    console.log(`DID: ${did}`);
    console.log(`DID Document: ${JSON.stringify(didDocument, null, 2)}`);
  } catch (error) {
    console.error("Error creating DID:", error);
  }
}

main().finally(() => client.close());