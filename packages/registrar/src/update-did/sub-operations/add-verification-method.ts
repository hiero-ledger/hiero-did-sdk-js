import { LifecycleRunner } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDAddVerificationMethodMessage,
  DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
} from '@swiss-digital-assets-institute/messages';
import { DIDError } from '@swiss-digital-assets-institute/core';
import { fragmentSearch } from '../helpers/fragment-search';
import { AddVerificationMethodOperation } from '../interface';
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
  const foundFragment = fragmentSearch(options.id, currentDidDocument);

  if (
    options.property === 'verificationMethod' &&
    !options.publicKeyMultibase
  ) {
    throw new DIDError(
      'invalidPublicKey',
      'The public key is required for verification methods',
    );
  }

  if (foundFragment.found && options.property === 'verificationMethod') {
    throw new DIDError(
      'invalidArgument',
      `The fragment ID '${options.id}' is already in use for another verification method`,
    );
  }

  if (
    foundFragment.found &&
    options.publicKeyMultibase &&
    options.publicKeyMultibase !== foundFragment.item['publicKeyMultibase']
  ) {
    throw new DIDError(
      'invalidArgument',
      `The fragment ID '${options.id}' is already in use for another verification method`,
    );
  }

  const manager = new LifecycleRunner(
    DIDAddVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const message = new DIDAddVerificationMethodMessage({
    did: operationOptions.did,
    controller: options.controller ?? operationOptions.did,
    id: options.id,
    publicKeyMultibase: options.publicKeyMultibase
      ? options.publicKeyMultibase
      : foundFragment.item['publicKeyMultibase'],
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
