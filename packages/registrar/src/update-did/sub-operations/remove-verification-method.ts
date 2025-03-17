import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  DIDRemoveVerificationMethodMessageHederaCSMLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { DIDError } from '@swiss-digital-assets-institute/core';
import { RemoveVerificationMethodOperation } from '../interface';
import { fragmentSearch } from '../helpers/fragment-search';
import {
  ExecuteFunction,
  PreExecuteFunction,
  PrepareFunction,
} from './interfaces';

export const prepare: PrepareFunction<
  DIDRemoveVerificationMethodMessage,
  RemoveVerificationMethodOperation
> = async (
  options,
  operationOptions,
  didDocument,
  clientMode,
  publisher,
  signer,
  verifier,
) => {
  const manager = new LifecycleRunner(
    clientMode
      ? DIDRemoveVerificationMethodMessageHederaCSMLifeCycle
      : DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const foundedFragment = fragmentSearch(options.id, didDocument);

  if (!foundedFragment.found) {
    throw new DIDError(
      'invalidArgument',
      'Verification method ID does not exist. Nothing to remove',
    );
  }

  if (foundedFragment.property === 'service') {
    throw new DIDError(
      'invalidArgument',
      'Cannot remove a service using `remove-verification-method` operation',
    );
  }

  const message = new DIDRemoveVerificationMethodMessage({
    did: operationOptions.did,
    id: options.id,
    property: foundedFragment.property,
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

export const preExecute: PreExecuteFunction<
  DIDRemoveVerificationMethodMessage
> = async (previousState, publisher, signature, verifier) => {
  const manager = new LifecycleRunner(
    DIDRemoveVerificationMethodMessageHederaCSMLifeCycle,
  );

  const state = await manager.resume(previousState, {
    publisher,
    args: {
      signature,
      verifier,
    },
  });

  return state;
};

export const execute: ExecuteFunction<
  DIDRemoveVerificationMethodMessage
> = async (previousState, clientMode, publisher, signer) => {
  const manager = new LifecycleRunner(
    clientMode
      ? DIDRemoveVerificationMethodMessageHederaCSMLifeCycle
      : DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const state = await manager.resume(previousState, {
    signer,
    publisher,
  });

  return state;
};
