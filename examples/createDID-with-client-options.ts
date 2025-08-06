/* 
  This example demonstrates how to create a DID with `clientOptions`. 
  This allows you to customize the Hedera network and account 
  used for creating the DID.
*/
import { createDID } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

async function main() {
  try {
    const { did, didDocument } = await createDID({
      clientOptions: {
        network: 'testnet',
        accountId,
        privateKey: operatorPrivateKey,
      },
    });

    console.log(`DID: ${did}`);
    console.log(`DID Document: ${JSON.stringify(didDocument, null, 2)}`);
  } catch (error) {
    console.error('Error creating DID:', error);
  }
}

main();
