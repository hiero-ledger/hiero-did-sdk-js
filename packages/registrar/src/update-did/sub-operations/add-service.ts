import { LifecycleRunner } from '@hiero-did-sdk/lifecycle';
import {
  DIDAddServiceMessage,
  DIDAddServiceMessageHederaDefaultLifeCycle,
  DIDAddServiceMessageHederaCSMLifeCycle,
} from '@hiero-did-sdk/messages';
import { AddServiceOperation } from '../interface';
import { haveId } from '../helpers/have-id';
import { ExecuteFunction, PreExecuteFunction, PrepareFunction } from './interfaces';
import { DIDError } from '@hiero-did-sdk/core';

export const prepare: PrepareFunction<DIDAddServiceMessage, AddServiceOperation> = async (
  options,
  operationOptions,
  currentDidDocument,
  clientMode,
  publisher,
  signer,
  verifier
) => {
  if (haveId(options.id, currentDidDocument)) {
    throw new DIDError('invalidArgument', 'Service id already exists');
  }

  const manager = new LifecycleRunner(
    clientMode ? DIDAddServiceMessageHederaCSMLifeCycle : DIDAddServiceMessageHederaDefaultLifeCycle
  );

  const message = new DIDAddServiceMessage({
    did: operationOptions.did,
    id: options.id,
    type: options.type,
    serviceEndpoint: options.serviceEndpoint,
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

export const preExecute: PreExecuteFunction<DIDAddServiceMessage> = async (
  previousState,
  publisher,
  signature,
  verifier
) => {
  const manager = new LifecycleRunner(DIDAddServiceMessageHederaCSMLifeCycle);

  const state = await manager.resume(previousState, {
    publisher,
    args: {
      signature,
      verifier,
    },
  });

  return state;
};

export const execute: ExecuteFunction<DIDAddServiceMessage> = async (previousState, clientMode, publisher, signer) => {
  const manager = new LifecycleRunner(
    clientMode ? DIDAddServiceMessageHederaCSMLifeCycle : DIDAddServiceMessageHederaDefaultLifeCycle
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
