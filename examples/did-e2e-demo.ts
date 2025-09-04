import { PrivateKey } from '@hashgraph/sdk';
import { createDID, deactivateDID, updateDID } from '@hiero-did-sdk/registrar';
import { resolveDID } from '@hiero-did-sdk/resolver';
import * as readline from 'node:readline';

const readLineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (text: string) => new Promise((resolve) => readLineInterface.question(text, resolve));

const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const clientOptions = {
  network: 'testnet' as const,
  accountId: operatorId,
  privateKey: operatorKey,
};

async function main() {
  const privateKey = await PrivateKey.generateED25519Async();

  console.log('Creating new Hedera DID...');

  const { did } = await createDID(
    { privateKey },
    {
      clientOptions,
    }
  );

  console.log(`Hedera DID has been created: ${did}`);

  console.log(`Resolving the DID...`);

  let didDocument = await resolveDID(did);

  console.log('Resolved DID Document:');
  console.log(JSON.stringify(didDocument, null, 2));

  await prompt('Press enter to proceed with updating the DID...');
  const serviceEndpoint = await prompt('Please enter DID service endpoint to add: ');

  console.log(`Updating the DID...`);

  await updateDID(
    {
      did,
      privateKey,
      updates: [
        {
          operation: 'add-service',
          id: '#service-1',
          type: 'VerifiableCredentialService',
          serviceEndpoint: serviceEndpoint as string,
        },
      ],
    },
    {
      clientOptions,
    }
  );

  console.log('Resolving the updated DID...');

  didDocument = await resolveDID(did);

  console.log('Resolved updated DID Document:');
  console.log(JSON.stringify(didDocument, null, 2));

  await prompt('Press enter to proceed with deactivating the DID...');

  console.log('Deactivating the DID...');

  await deactivateDID({ did, privateKey }, { clientOptions });

  console.log('Resolving the deactivated DID...');

  didDocument = await resolveDID(did);

  console.log('Resolved deactivated DID Document:');
  console.log(JSON.stringify(didDocument, null, 2));
}

main().finally(() => readLineInterface.close());
