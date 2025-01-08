import {
  DIDRemoveServiceMessage,
  DIDRemoveServiceMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import { RemoveServiceOperation } from '../interface';
import { ExecuteFunction, PrepareFunction } from './interfaces';

export const prepare: PrepareFunction<
  DIDRemoveServiceMessage,
  RemoveServiceOperation
> = async (options, operationOptions, _, signer, publisher) => {
  const manager = new LifecycleRunner(
    DIDRemoveServiceMessageHederaDefaultLifeCycle,
  );

  const message = new DIDRemoveServiceMessage({
    did: operationOptions.did,
    id: options.id,
  });

  const state = await manager.process(message, {
    signer,
    publisher,
  });

  return state;
};

export const execute: ExecuteFunction<DIDRemoveServiceMessage> = async (
  previousState,
  signer,
  publisher,
) => {
  const manager = new LifecycleRunner(
    DIDRemoveServiceMessageHederaDefaultLifeCycle,
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
