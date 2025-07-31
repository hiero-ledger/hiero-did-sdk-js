import {
  DIDRemoveServiceMessage,
  DIDRemoveServiceMessageHederaDefaultLifeCycle,
  DIDRemoveServiceMessageHederaCSMLifeCycle,
} from '@hiero-did-sdk/messages';
import { LifecycleRunner } from '@hiero-did-sdk/lifecycle';
import { RemoveServiceOperation } from '../interface';
import { ExecuteFunction, PreExecuteFunction, PrepareFunction } from './interfaces';

export const prepare: PrepareFunction<DIDRemoveServiceMessage, RemoveServiceOperation> = async (
  options,
  operationOptions,
  _,
  clientMode,
  publisher,
  signer,
  verifier
) => {
  const manager = new LifecycleRunner(
    clientMode ? DIDRemoveServiceMessageHederaCSMLifeCycle : DIDRemoveServiceMessageHederaDefaultLifeCycle
  );

  const message = new DIDRemoveServiceMessage({
    did: operationOptions.did,
    id: options.id,
  });

  const state = await manager.process(message, {
    signer,
    publisher,
    args: {
      verifier,
    },
  });

  return state;
};

export const preExecute: PreExecuteFunction<DIDRemoveServiceMessage> = async (
  previousState,
  publisher,
  signature,
  verifier
) => {
  const manager = new LifecycleRunner(DIDRemoveServiceMessageHederaCSMLifeCycle);

  const state = await manager.resume(previousState, {
    publisher,
    args: {
      signature,
      verifier,
    },
  });

  return state;
};

export const execute: ExecuteFunction<DIDRemoveServiceMessage> = async (
  previousState,
  clientMode,
  publisher,
  signer
) => {
  const manager = new LifecycleRunner(
    clientMode ? DIDRemoveServiceMessageHederaCSMLifeCycle : DIDRemoveServiceMessageHederaDefaultLifeCycle
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
