import { AnonCredsSchema } from '../specification';
import {
  AnonCredsOperationStateAction,
  AnonCredsOperationStateFailed,
  AnonCredsOperationStateFinished,
  AnonCredsOperationStateWait,
  AnonCredsResolutionMetadata,
  Extensible,
} from './base';

export interface GetSchemaReturn {
  schema?: AnonCredsSchema;
  schemaId: string;
  resolutionMetadata: AnonCredsResolutionMetadata;
  schemaMetadata: Extensible;
}

export interface RegisterSchemaOptions {
  schema: AnonCredsSchema;
  issuerKeyDer: string;
}

export interface RegisterSchemaReturnStateFailed extends AnonCredsOperationStateFailed {
  schema?: AnonCredsSchema;
  schemaId?: string;
}

export interface RegisterSchemaReturnStateFinished extends AnonCredsOperationStateFinished {
  schema: AnonCredsSchema;
  schemaId: string;
}

export interface RegisterSchemaReturnStateAction extends AnonCredsOperationStateAction {
  schema: AnonCredsSchema;
  schemaId: string;
}

export interface RegisterSchemaReturnStateWait extends AnonCredsOperationStateWait {
  schema?: AnonCredsSchema;
  schemaId?: string;
}

export interface RegisterSchemaReturn {
  jobId?: string;
  schemaState:
    | RegisterSchemaReturnStateWait
    | RegisterSchemaReturnStateAction
    | RegisterSchemaReturnStateFinished
    | RegisterSchemaReturnStateFailed;
  schemaMetadata: Extensible;
  registrationMetadata: Extensible;
}
