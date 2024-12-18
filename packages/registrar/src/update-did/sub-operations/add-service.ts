import {
  DIDDocument,
  Publisher,
  Signer,
} from '@swiss-digital-assets-institute/core';
import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDAddServiceMessage,
  DIDAddServiceMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { AddServiceOperation, UpdateDIDOptions } from '../interface';
import { haveId } from '../helpers/have-id';

export async function addService(
  options: AddServiceOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
  currentDidDocument: DIDDocument,
) {
  if (haveId(options.id, currentDidDocument)) {
    throw new Error('Service id already exists');
  }

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
