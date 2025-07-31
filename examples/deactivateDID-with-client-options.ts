/*
 * This example demonstrates how to deactivate a DID using the
 * `deactivateDID` function with custom client options.
 */
import { deactivateDID } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

async function main() {
  try {
    const deactivatedDidDocument = await deactivateDID(
      {
        did: 'did:hedera:testnet:RTHEmJFVw6fPPkUuFhL5f8j8ShFrVvtUcZuVq3k2pWR_0.0.5217512',
        privateKey,
      },
      {
        clientOptions: {
          network: 'testnet',
          accountId,
          privateKey,
        },
      }
    );

    console.log(`Deactivated DID Document: ${JSON.stringify(deactivatedDidDocument, null, 2)}`);
  } catch (error) {
    console.error('Error deactivating DID:', error);
  }
}

main();
