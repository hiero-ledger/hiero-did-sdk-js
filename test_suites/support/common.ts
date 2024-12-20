import { createDID } from '@swiss-digital-assets-institute/registrar';
import { Signer } from '../../packages/signer-internal/src/signer';
import { DIDWorld } from './context';

export async function basicCreateDID(didWorld: DIDWorld) {
  try {
    const { did, didDocument, privateKey } = await createDID({
      signer: new Signer(didWorld.sharedData['operatorPrivateKey'] as string),
      clientOptions: {
        privateKey: didWorld.sharedData['operatorPrivateKey'],
        accountId: didWorld.sharedData['operatorAccountId'],
        network: didWorld.sharedData['network'],
      },
    });

    didWorld.sharedData['did'] = did;
    didWorld.sharedData['didDocument'] = didDocument;
    didWorld.sharedData['privateKey'] = privateKey;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    didWorld.sharedData['error'] = error.message;
  }
}