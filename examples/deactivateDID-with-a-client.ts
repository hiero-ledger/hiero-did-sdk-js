/*
 * This example demonstrates how to deactivate a DID using the
 * `deactivateDID` function with a Hedera Client instance.
 */
import { Client } from '@hashgraph/sdk';
import { deactivateDID } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

async function main() {
  try {
    const deactivatedDidDocument = await deactivateDID(
      {
        did: 'did:hedera:testnet:RTHEmJFVw6fPPkUuFhL5f8j8ShFrVvtUcZuVq3k2pWR_0.0.5217512',
        privateKey,
      },
      {
        client,
      }
    );

    console.log(`Deactivated DID Document: ${JSON.stringify(deactivatedDidDocument, null, 2)}`);
  } catch (error) {
    console.error('Error deactivating DID:', error);
  }
}

main();
