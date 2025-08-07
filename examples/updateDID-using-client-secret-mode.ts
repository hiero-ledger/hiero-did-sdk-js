/*
 * This example demonstrates how to update a DID document in Client Managed Secret Mode.
 */
import { Client, PrivateKey } from '@hashgraph/sdk';
import { generateUpdateDIDRequest, submitUpdateDIDRequest, DIDUpdateBuilder } from '@hiero-did-sdk/registrar';

const accountId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorPrivateKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const client = Client.forTestnet();
client.setOperator(accountId, operatorPrivateKey);

async function main() {
  try {
    const rootKey = PrivateKey.fromStringED25519(operatorPrivateKey);

    const { states, signingRequests } = await generateUpdateDIDRequest(
      {
        did: 'did:hedera:testnet:FVY9G25xhEAEarDLCBzmzxCZpa5KLzMND727jX7EDfbH_0.0.5445595',
        updates: new DIDUpdateBuilder()
          .addVerificationMethod({
            id: '#key-1',
            publicKeyMultibase: 'zFWtKjvQAZHw41LYKqZeQoogDZYjkM1c1eGVJFMip75dD',
          })
          .addService({
            id: '#service-1',
            type: 'VerifiableCredentialService',
            serviceEndpoint: 'https://example.com/vc/',
          })
          .build(),
      },
      {
        client,
      }
    );

    const signatures = Object.keys(signingRequests).reduce((acc, request) => {
      const signingRequest = signingRequests[request];
      const signature = rootKey.sign(signingRequest.serializedPayload);

      return {
        ...acc,
        [request]: signature,
      };
    }, {});

    const updatedDidDocument = await submitUpdateDIDRequest(
      { states, signatures },
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
