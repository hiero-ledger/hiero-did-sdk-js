import { Publisher, Signer } from '@swiss-digital-assets-institute/core';
import {
  DIDRemoveServiceMessage,
  DIDRemoveServiceMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import { RemoveServiceOperation, UpdateDIDOptions } from '../interface';

export async function removeService(
  options: RemoveServiceOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
) {
  const manager = new LifecycleRunner(
    DIDRemoveServiceMessageHederaDefaultLifeCycle,
  );

  const didUpdateMessage = new DIDRemoveServiceMessage({
    did: operationOptions.did,
    id: options.id,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}
