/*
  This example demonstrates how to create a DID with a custom
  `controller`. The controller is the DID that has the authority
  to update or deactivate the DID document.
*/
import { Client } from '@hashgraph/sdk';
import { createDID } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

async function main() {
  try {
    const { did, didDocument } = await createDID(
      {
        controller: 'did:hedera:testnet:WGBsUL1k5utNcPaR8b12zY1FbYnRN2YMLQBB8azzo4o_0.0.5213298',
      },
      {
        client,
      }
    );

    console.log(`DID: ${did}`);
    console.log(`DID Document: ${JSON.stringify(didDocument, null, 2)}`);
  } catch (error) {
    console.error('Error creating DID:', error);
  }
}

main().finally(() => client.close());
