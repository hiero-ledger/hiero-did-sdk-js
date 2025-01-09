import {
  DIDDocument,
  Publisher,
  Signer,
} from '@swiss-digital-assets-institute/core';
import { RunnerState } from '@swiss-digital-assets-institute/lifecycle';
import { DIDMessage } from '@swiss-digital-assets-institute/core';

import {
  DIDUpdateOperation,
  DIDUpdateOperationsKeys,
  UpdateDIDOptions,
} from '../interface';
import * as AddVerificationMethod from './add-verification-method';
import * as RemoveVerificationMethod from './remove-verification-method';
import * as AddService from './add-service';
import * as RemoveService from './remove-service';
import { ExecuteFunction, PrepareFunction } from './interfaces';

interface OperationMapValue {
  execute: ExecuteFunction;
  prepare: PrepareFunction;
}

const OPERATIONS_MAP: Record<DIDUpdateOperationsKeys, OperationMapValue> = {
  'add-verification-method': AddVerificationMethod,
  'remove-verification-method': RemoveVerificationMethod,
  'add-service': AddService,
  'remove-service': RemoveService,
} as const;

export async function prepareOperation<T extends DIDUpdateOperation>(
  data: T,
  options: UpdateDIDOptions,
  currentDidDocument: DIDDocument,
  signer: Signer,
  publisher: Publisher,
): Promise<RunnerState<DIDMessage>> {
  return await OPERATIONS_MAP[data.operation].prepare(
    data,
    options,
    currentDidDocument,
    signer,
    publisher,
  );
}

export async function executeOperation<
  Operation extends DIDUpdateOperationsKeys,
>(
  operation: Operation,
  message: RunnerState<DIDMessage>,
  signer: Signer,
  publisher: Publisher,
): Promise<RunnerState<DIDMessage>> {
  return await OPERATIONS_MAP[operation].execute(message, signer, publisher);
}
