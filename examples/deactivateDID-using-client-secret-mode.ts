/*
 * This example demonstrates how to deactivate a DID in Client Managed Secret Mode.
 */
import { Client, PrivateKey } from '@hashgraph/sdk';
import { generateDeactivateDIDRequest, submitDeactivateDIDRequest } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

async function main() {
  try {
    const rootKey = PrivateKey.fromStringED25519(operatorPrivateKey);

    const { state, signingRequest } = await generateDeactivateDIDRequest(
      {
        did: 'did:hedera:testnet:FVY9G25xhEAEarDLCBzmzxCZpa5KLzMND727jX7EDfbH_0.0.5445595',
      },
      {
        client,
      }
    );

    const signature = rootKey.sign(signingRequest.serializedPayload);

    const deactivatedDidDocument = await submitDeactivateDIDRequest(
      { state, signature },
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
