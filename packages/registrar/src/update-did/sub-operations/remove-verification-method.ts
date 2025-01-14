import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { RemoveVerificationMethodOperation } from '../interface';
import { ExecuteFunction, PrepareFunction } from './interfaces';
import { fragmentSearch } from '../helpers/fragment-search';

export const prepare: PrepareFunction<
  DIDRemoveVerificationMethodMessage,
  RemoveVerificationMethodOperation
> = async (options, operationOptions, didDocument, signer, publisher) => {
  const manager = new LifecycleRunner(
    DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const foundedFragment = fragmentSearch(options.id, didDocument);

  if (!foundedFragment.found) {
    throw new Error('Verification method id does not exist. Nothing to remove');
  }

  if (foundedFragment.property === 'service') {
    throw new Error(
      'Cannot remove service using remove-verification-method operation',
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
