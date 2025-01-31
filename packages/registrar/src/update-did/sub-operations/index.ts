import {
  DIDDocument,
  Publisher,
  Signer,
  Verifier,
  DIDMessage,
} from '@swiss-digital-assets-institute/core';
import { RunnerState } from '@swiss-digital-assets-institute/lifecycle';
import {
  DIDUpdateOperation,
  DIDUpdateOperationsKeys,
  UpdateDIDOptions,
} from '../interface';
import * as AddVerificationMethod from './add-verification-method';
import * as RemoveVerificationMethod from './remove-verification-method';
import * as AddService from './add-service';
import * as RemoveService from './remove-service';
import {
  ExecuteFunction,
  PreExecuteFunction,
  PrepareFunction,
} from './interfaces';

interface OperationMapValue {
  execute: ExecuteFunction;
  preExecute: PreExecuteFunction;
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
  clientMode: boolean,
  publisher: Publisher,
  signer?: Signer,
): Promise<RunnerState<DIDMessage>> {
  return await OPERATIONS_MAP[data.operation].prepare(
    data,
    options,
    currentDidDocument,
    clientMode,
    publisher,
    signer,
  );
}

export async function preExecuteOperation<
  Operation extends DIDUpdateOperationsKeys,
>(
  operation: Operation,
  message: RunnerState<DIDMessage>,
  publisher: Publisher,
  signature: Uint8Array,
  verifier: Verifier,
): Promise<RunnerState<DIDMessage>> {
  return await OPERATIONS_MAP[operation].preExecute(
    message,
    publisher,
    signature,
    verifier,
  );
}

export async function executeOperation<
  Operation extends DIDUpdateOperationsKeys,
>(
  operation: Operation,
  message: RunnerState<DIDMessage>,
  clientMode: boolean,
  publisher: Publisher,
  signer?: Signer,
): Promise<RunnerState<DIDMessage>> {
  return await OPERATIONS_MAP[operation].execute(
    message,
    clientMode,
    publisher,
    signer,
  );
}
