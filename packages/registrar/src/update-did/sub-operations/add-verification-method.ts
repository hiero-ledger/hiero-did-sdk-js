import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { AddVerificationMethodOperation } from '../interface';
import { haveId } from '../helpers/have-id';
import { ExecuteFunction, PrepareFunction } from './interfaces';

export const prepare: PrepareFunction<
  DIDAddVerificationMethodMessage,
  AddVerificationMethodOperation
> = async (
  options,
  operationOptions,
  currentDidDocument,
  signer,
  publisher,
) => {
  if (haveId(options.id, currentDidDocument)) {
    throw new Error('Verification method id already exists');
  }

  const manager = new LifecycleRunner(
    DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const message = new DIDAddVerificationMethodMessage({
    did: operationOptions.did,
    controller: options.controller ?? operationOptions.did,
    id: options.id,
    publicKeyMultibase: options.publicKeyMultibase,
    property: options.property,
  });

  const state = await manager.process(message, {
    signer,
    publisher,
  });

  return state;
};

export const execute: ExecuteFunction<DIDAddVerificationMethodMessage> = async (
  previousState,
  signer,
  publisher,
) => {
  const manager = new LifecycleRunner(
    DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
