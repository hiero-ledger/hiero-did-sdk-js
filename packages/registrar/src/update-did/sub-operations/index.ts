import {
  DIDDocument,
  Publisher,
  Signer,
} from '@swiss-digital-assets-institute/core';
import { addVerificationMethod } from './add-verification-method';
import { removeVerificationMethod } from './remove-verification-method';
import { addService } from './add-service';
import { removeService } from './remove-service';
import { DIDUpdateOperation, UpdateDIDOptions } from '../interface';

const OPERATIONS_MAP = {
  'add-verification-method': addVerificationMethod,
  'remove-verification-method': removeVerificationMethod,
  'add-service': addService,
  'remove-service': removeService,
} as const;

export async function callOperation<T extends DIDUpdateOperation>(
  data: T,
  options: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
  currentDidDocument: DIDDocument,
) {
  return await OPERATIONS_MAP[data.operation](
    data as never,
    options,
    signer,
    publisher,
    currentDidDocument,
  );
}
