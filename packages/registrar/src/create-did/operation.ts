import {
  DIDOwnerMessage,
  DIDOwnerMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';
import { InternalPublisher } from '@swiss-digital-assets-institute/publisher-internal';
import { PublicKey } from '@hashgraph/sdk';
import { CreateDIDOptions, CreateDIDResult } from './interface';
import { Providers } from '../interfaces';
import { extractOptions, extractProviders } from './utils';
import { getPublisher } from '../shared/get-publisher';
import { getSigner } from '../shared/get-signer';

/**
 * Create a new DID on the Hedera network.
 * @param providers The providers used to create the DID.
 * @returns The DID and DID document, along with the private key if it was generated.
 */
export function createDID(providers: Providers): Promise<CreateDIDResult>;

/**
 * Create a new DID on the Hedera network.
 * @param options The options used to create the DID.
 * @param providers The providers used to create the DID.
 * @returns The DID and DID document, along with the private key if it was generated.
 */
export function createDID(
  options: CreateDIDOptions,
  providers: Providers,
): Promise<CreateDIDResult>;
export async function createDID(
  providersOrOptions: Providers | CreateDIDOptions,
  providers?: Providers,
): Promise<CreateDIDResult> {
  const operationProviders = extractProviders(providersOrOptions, providers);
  const operationOptions = extractOptions(providersOrOptions);

  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey,
    true,
  );

  const publicKey = await signer.publicKey();

  const didOwnerMessage = new DIDOwnerMessage({
    publicKey: PublicKey.fromStringED25519(publicKey),
    controller: operationOptions.controller,
    topicId: operationOptions.topicId,
  });

  const manager = new LifecycleRunner(DIDOwnerMessageHederaDefaultLifeCycle);

  const state = await manager.process(didOwnerMessage, { signer, publisher });

  if (
    operationProviders.clientOptions instanceof Object &&
    publisher instanceof InternalPublisher
  ) {
    publisher.client.close();
  }

  if (state.status !== 'success') {
    throw new Error('DID creation failed');
  }

  return {
    did: didOwnerMessage.did,
    privateKey: signer instanceof Signer ? signer.privateKey : undefined,
    didDocument: {
      id: didOwnerMessage.did,
      controller: didOwnerMessage.controllerDid,
      verificationMethod: [
        {
          id: `${didOwnerMessage.did}#did-root-key`,
          type: 'Ed25519VerificationKey2020',
          controller: didOwnerMessage.controllerDid,
          publicKeyMultibase: publicKey,
        },
      ],
    },
  };
}
