/* eslint-disable @typescript-eslint/no-unused-vars */
// Remove the above line after implementation

import { DIDAddVerificationMethodMessage } from '@hashgraph-did-sdk/messages';
import { Signer } from '@hashgraph/sdk';
import { Publisher } from '@hashgraph-did-sdk/core';
import { RemoveServiceOperation, UpdateDIDOptions } from '../interface';

// TODO: Implement this operation
export function removeService(
  options: RemoveServiceOperation,
  operationOptions: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
) {
  throw new Error('Method not implemented.');
}

export const removeServiceConfig = {
  'remove-service': {
    apply: removeService,
    message: DIDAddVerificationMethodMessage,
  },
} as const;
