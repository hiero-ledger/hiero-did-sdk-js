/* 
  This example demonstrates how to create a DID in Client Managed Secret Mode.
  This mode is useful when you want to manage the secret key yourself.
*/
import { Client, PrivateKey } from '@hashgraph/sdk';
import {
  generateCreateDIDRequest,
  submitCreateDIDRequest,
} from '@swiss-digital-assets-institute/registrar';
import { KeysUtility } from '../packages/core/src';

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

async function main() {
  try {
    const rootKey = PrivateKey.fromStringED25519(operatorPrivateKey);
    const publicMultibaseRootKey = KeysUtility.fromPublicKey(
      rootKey.publicKey,
    ).toMultibase();

    const { state, signingRequest } = await generateCreateDIDRequest(
      {
        multibasePublicKey: publicMultibaseRootKey,
      },
      {
        client,
      },
    );

    const signature = rootKey.sign(signingRequest.serializedPayload);

    const { did, didDocument } = await submitCreateDIDRequest(
      { state, signature },
      {
        client,
      },
    );

    console.log(`DID: ${did}`);
    console.log(`DID Document: ${JSON.stringify(didDocument, null, 2)}`);
  } catch (error) {
    console.error('Error creating DID:', error);
  }
}

main().finally(() => client.close());
