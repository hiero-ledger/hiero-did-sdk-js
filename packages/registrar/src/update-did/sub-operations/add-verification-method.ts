import { Publisher, Signer } from '@hashgraph-did-sdk/core';
import { LifecycleRunner } from '@hashgraph-did-sdk/lifecycle';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
} from '@hashgraph-did-sdk/messages';
import { AddVerificationMethodOperation, UpdateDIDOptions } from '../interface';

export async function addVerificationMethod(
  options: AddVerificationMethodOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
) {
  const manager = new LifecycleRunner(
    DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const didUpdateMessage = new DIDAddVerificationMethodMessage({
    did: operationOptions.did,
    controller: options.controller ?? operationOptions.did,
    // verify id
    id: options.id,
    // verify publicKeyMultibase
    publicKeyMultibase: options.publicKeyMultibase,
    property: options.property,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}

export const addVerificationMethodConfig = {
  'add-verification-method': {
    apply: addVerificationMethod,
    message: DIDAddVerificationMethodMessage,
  },
} as const;
