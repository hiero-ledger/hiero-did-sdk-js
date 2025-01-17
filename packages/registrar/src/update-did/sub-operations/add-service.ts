import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDAddServiceMessage,
  DIDAddServiceMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { AddServiceOperation } from '../interface';
import { haveId } from '../helpers/have-id';
import { ExecuteFunction, PrepareFunction } from './interfaces';
import { DIDError } from '@swiss-digital-assets-institute/core';

export const prepare: PrepareFunction<
  DIDAddServiceMessage,
  AddServiceOperation
> = async (
  options,
  operationOptions,
  currentDidDocument,
  signer,
  publisher,
) => {
  if (haveId(options.id, currentDidDocument)) {
    throw new DIDError('invalidArgument', 'Service id already exists');
  }

  const manager = new LifecycleRunner(
    DIDAddServiceMessageHederaDefaultLifeCycle,
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
  });

  return state;
};

export const execute: ExecuteFunction<DIDAddServiceMessage> = async (
  previousState,
  signer,
  publisher,
) => {
  const manager = new LifecycleRunner(
    DIDAddServiceMessageHederaDefaultLifeCycle,
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
