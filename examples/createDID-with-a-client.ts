/* 
  This example demonstrates how to create a DID using a pre-configured 
  Hedera `Client` instance. This allows for more control over the 
  client's configuration and network interaction.
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
      client,
    });

    console.log(`DID: ${did}`);
    console.log(`DID Document: ${JSON.stringify(didDocument, null, 2)}`);
  } catch (error) {
    console.error("Error creating DID:", error);
  }
}

main().finally(() => client.close());
