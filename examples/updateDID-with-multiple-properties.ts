/*
 * This example demonstrates how to update multiple properties of a
 * DID document simultaneously using the `updateDID` function.
 */
import { Client } from '@hashgraph/sdk';
import { updateDID } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

async function main() {
  try {
    const updatedDidDocument = await updateDID(
      {
        did: 'did:hedera:testnet:RTHEmJFVw6fPPkUuFhL5f8j8ShFrVvtUcZuVq3k2pWR_0.0.5217512',
        updates: [
          {
            operation: 'add-verification-method',
            id: '#key-1',
            property: 'verificationMethod',
            publicKeyMultibase: 'z6MkkFf6yboMwr1LQVAHqatuGYD9foRe7L2wPkEn1A7LyoQb', // Example public key
          },
          {
            operation: 'add-verification-method',
            id: '#key-2',
            property: 'authentication',
            publicKeyMultibase: 'z6LkvJvxq7f6AtSXfd9vG91pYtD9foRe7L2wPkEn1A7LyoQb', // Example public key
          },
          {
            operation: 'remove-service',
            id: '#service-1',
          },
        ],
        privateKey: operatorPrivateKey,
      },
      {
        client,
      }
    );

    console.log(`Updated DID Document: ${JSON.stringify(updatedDidDocument, null, 2)}`);
  } catch (error) {
    console.error('Error updating DID:', error);
  }
}

main().finally(() => client.close());
