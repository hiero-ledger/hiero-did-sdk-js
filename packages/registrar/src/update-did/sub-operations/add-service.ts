import { Publisher, Signer } from '@hashgraph-did-sdk/core';
import { LifecycleRunner } from '@hashgraph-did-sdk/lifecycle';
import {
  DIDAddServiceMessage,
  DIDAddServiceMessageHederaDefaultLifeCycle,
} from '@hashgraph-did-sdk/messages';
import { AddServiceOperation, UpdateDIDOptions } from '../interface';

export async function addService(
  options: AddServiceOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
) {
  const manager = new LifecycleRunner(
    DIDAddServiceMessageHederaDefaultLifeCycle,
  );

  const didUpdateMessage = new DIDAddServiceMessage({
    did: operationOptions.did,
    id: options.id,
    type: options.type,
    serviceEndpoint: options.serviceEndpoint,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}
