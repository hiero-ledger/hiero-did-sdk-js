import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { RemoveVerificationMethodOperation } from '../interface';
import { ExecuteFunction, PrepareFunction } from './interfaces';

export const prepare: PrepareFunction<
  DIDRemoveVerificationMethodMessage,
  RemoveVerificationMethodOperation
> = async (options, operationOptions, _, signer, publisher) => {
  const manager = new LifecycleRunner(
    DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const message = new DIDRemoveVerificationMethodMessage({
    did: operationOptions.did,
    id: options.id,
    property: options.property,
  });

  const state = await manager.process(message, {
    signer,
    publisher,
  });

  return state;
};

export const execute: ExecuteFunction<
  DIDRemoveVerificationMethodMessage
> = async (previousState, signer, publisher) => {
  const manager = new LifecycleRunner(
    DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
