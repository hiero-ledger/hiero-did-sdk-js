import { DIDUpdateOperation, UpdateDIDOptions } from '../interface';
import { addVerificationMethodConfig } from './add-verification-method';
import { removeVerificationMethodConfig } from './remove-verification-method';
import { addServiceConfig } from './add-service';
import { removeServiceConfig } from './remove-service';
import { Publisher, Signer } from '@hashgraph-did-sdk/core';

const operationsAvailable = {
  ...removeVerificationMethodConfig,
  ...addVerificationMethodConfig,
  ...addServiceConfig,
  ...removeServiceConfig,
} as const;

type Operations = DIDUpdateOperation['operation'];
type OperationFunction<Operation extends Operations> = (
  operation: Extract<DIDUpdateOperation, { operation: Operation }>,
  options: UpdateDIDOptions,
  signer: Signer,
  publisher: Publisher,
) => ReturnType<(typeof operationsAvailable)[Operation]['apply']>;
type OperationsMap = {
  [Operation in Operations]: OperationFunction<Operation>;
};

export const OPERATIONS_MAP = Object.keys(operationsAvailable).reduce(
  (acc, operation: Operations) => {
    return {
      ...acc,
      [operation]: operationsAvailable[operation].apply,
    };
  },
  {} as OperationsMap,
);
