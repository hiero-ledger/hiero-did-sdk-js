import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import { InternalPublisher } from '@swiss-digital-assets-institute/publisher-internal';
import {
  DIDDeactivateMessage,
  DIDDeactivateMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { DeactivateDIDOptions, DeactivateDIDResult } from './interface';
import { Providers } from '../interfaces';
import { getPublisher } from '../shared/get-publisher';
import { getSigner } from '../shared/get-signer';

/**
 * Deactivate a DID on the Hedera network
 * @param operationOptions Options for deactivating a DID
 * @param operationProviders Providers for deactivating a DID
 * @returns The result of deactivating a DID
 */
export async function deactivateDID(
  operationOptions: DeactivateDIDOptions,
  operationProviders: Providers,
): Promise<DeactivateDIDResult> {
  const publisher = getPublisher(operationProviders);
  const signer = getSigner(
    operationProviders.signer,
    operationOptions.privateKey,
  );

  const didDeactivateMessage = new DIDDeactivateMessage({
    did: operationOptions.did,
  });

  const manager = new LifecycleRunner(
    DIDDeactivateMessageHederaDefaultLifeCycle,
  );

  const state = await manager.process(didDeactivateMessage, {
    signer,
    publisher,
  });

  if (
    operationProviders.client instanceof Object &&
    publisher instanceof InternalPublisher
  ) {
    publisher.client.close();
  }

  if (state.status !== 'success') {
    throw new Error('DID deactivation failed');
  }

  // TODO: return proper DID document
  return {
    did: didDeactivateMessage.did,
    didDocument: {
      id: didDeactivateMessage.did,
      controller: didDeactivateMessage.did,
      verificationMethod: [],
    },
  };
}
