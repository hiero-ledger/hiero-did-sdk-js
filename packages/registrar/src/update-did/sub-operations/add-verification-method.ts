import { Publisher, Signer } from '@swiss-digital-assets-institute/core';
import { LifecycleRunner, RunnerState } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { AddVerificationMethodOperation, UpdateDIDOptions } from '../interface';

export async function addVerificationMethod(
  options: AddVerificationMethodOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
): Promise<RunnerState<DIDAddVerificationMethodMessage>> {
  const manager = new LifecycleRunner(
    DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const didUpdateMessage = new DIDAddVerificationMethodMessage({
    did: operationOptions.did,
    controller: options.controller ?? operationOptions.did,
    id: options.id,
    publicKeyMultibase: options.publicKeyMultibase,
    property: options.property,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}
