import { Publisher, Signer } from '@hashgraph-did-sdk/core';
import { LifecycleRunner } from '@hashgraph-did-sdk/lifecycle';
import {
  DIDRemoveVerificationMethodMessage,
  DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
} from '@hashgraph-did-sdk/messages';
import {
  RemoveVerificationMethodOperation,
  UpdateDIDOptions,
} from '../interface';

export async function removeVerificationMethod(
  options: RemoveVerificationMethodOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
) {
  const manager = new LifecycleRunner(
    DIDRemoveVerificationMethodMessageHederaDefaultLifeCycle,
  );

  const didUpdateMessage = new DIDRemoveVerificationMethodMessage({
    did: operationOptions.did,
    id: options.id,
    property: options.property,
  });

  const state = await manager.process(didUpdateMessage, {
    signer,
    publisher,
  });

  return state;
}

export const removeVerificationMethodConfig = {
  'remove-verification-method': {
    apply: removeVerificationMethod,
    message: DIDRemoveVerificationMethodMessage,
  },
} as const;
