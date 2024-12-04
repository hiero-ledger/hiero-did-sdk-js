import { createDID } from '@swiss-digital-assets-institute/registrar';

async function createDIDExample() {
  const accountId = process.env.HEDERA_TESTNET_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_TESTNET_PRIVATE_KEY;

  console.log('accountId', accountId);
  console.log('privateKey', privateKey);

  await createDID({
    clientOptions: {
      network: 'testnet',
      accountId,
      privateKey,
    },
  });
}

createDIDExample()
  .then(() => console.log('DID created successfully'))
  .catch((error) => console.error(error));
