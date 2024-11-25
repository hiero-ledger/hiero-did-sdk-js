import { Publisher, Signer } from '@hashgraph-did-sdk/core';
import {
  DIDRemoveServiceMessage,
  DIDRemoveServiceMessageHederaDefaultLifeCycle,
} from '@hashgraph-did-sdk/messages';
import { LifecycleRunner } from '@hashgraph-did-sdk/lifecycle';
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
