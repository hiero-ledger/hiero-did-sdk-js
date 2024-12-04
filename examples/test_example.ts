import { createDID } from '@swiss-digital-assets-institute/registrar';

async function testExample() {
  const did = await createDID({
    clientOptions: {
      network: 'testnet',
      accountId: '0.0.12345',
      privateKey:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
  });
  console.log(did);
}

testExample()
  .then(() => console.log('Example finished'))
  .catch(console.error);
