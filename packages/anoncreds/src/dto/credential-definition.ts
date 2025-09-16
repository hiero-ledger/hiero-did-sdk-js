import { AnonCredsCredentialDefinition } from '../specification';
import {
  AnonCredsOperationStateAction,
  AnonCredsOperationStateFailed,
  AnonCredsOperationStateFinished,
  AnonCredsOperationStateWait,
  AnonCredsResolutionMetadata,
  Extensible,
} from './base';
import { Signer } from '@hiero-did-sdk/core';

export interface GetCredentialDefinitionReturn {
  credentialDefinition?: AnonCredsCredentialDefinition;
  credentialDefinitionId: string;
  resolutionMetadata: AnonCredsResolutionMetadata;
  credentialDefinitionMetadata: Extensible;
}

export interface RegisterCredentialDefinitionOptions {
  credentialDefinition: AnonCredsCredentialDefinition;
  issuerKeySigner: Signer;
  options?: { supportRevocation: boolean };
}

export interface RegisterCredentialDefinitionReturnStateFailed extends AnonCredsOperationStateFailed {
  credentialDefinition?: AnonCredsCredentialDefinition;
  credentialDefinitionId?: string;
}

export interface RegisterCredentialDefinitionReturnStateFinished extends AnonCredsOperationStateFinished {
  credentialDefinition: AnonCredsCredentialDefinition;
  credentialDefinitionId: string;
}

export interface RegisterCredentialDefinitionReturnStateWait extends AnonCredsOperationStateWait {
  credentialDefinition?: AnonCredsCredentialDefinition;
  credentialDefinitionId?: string;
}

export interface RegisterCredentialDefinitionReturnStateAction extends AnonCredsOperationStateAction {
  credentialDefinitionId: string;
  credentialDefinition: AnonCredsCredentialDefinition;
}

export interface RegisterCredentialDefinitionReturn {
  jobId?: string;
  credentialDefinitionState:
    | RegisterCredentialDefinitionReturnStateWait
    | RegisterCredentialDefinitionReturnStateAction
    | RegisterCredentialDefinitionReturnStateFinished
    | RegisterCredentialDefinitionReturnStateFailed;
  credentialDefinitionMetadata: Extensible;
  registrationMetadata: Extensible;
}
