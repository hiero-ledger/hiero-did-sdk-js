import { AnonCredsRevocationRegistryDefinition } from '../specification';
import {
  AnonCredsOperationStateAction,
  AnonCredsOperationStateFailed,
  AnonCredsOperationStateFinished,
  AnonCredsOperationStateWait,
  AnonCredsResolutionMetadata,
  Extensible,
} from './base';
import { Signer } from '@hiero-did-sdk/core';

export interface GetRevocationRegistryDefinitionReturn {
  revocationRegistryDefinition?: AnonCredsRevocationRegistryDefinition;
  revocationRegistryDefinitionId: string;
  resolutionMetadata: AnonCredsResolutionMetadata;
  revocationRegistryDefinitionMetadata: Extensible;
}

export interface RegisterRevocationRegistryDefinitionOptions {
  revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
  issuerKeySigner: Signer;
}

export interface RegisterRevocationRegistryDefinitionReturnStateAction extends AnonCredsOperationStateAction {
  revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
  revocationRegistryDefinitionId: string;
}

export interface RegisterRevocationRegistryDefinitionReturnStateFailed extends AnonCredsOperationStateFailed {
  revocationRegistryDefinition?: AnonCredsRevocationRegistryDefinition;
  revocationRegistryDefinitionId?: string;
}

export interface RegisterRevocationRegistryDefinitionReturnStateWait extends AnonCredsOperationStateWait {
  revocationRegistryDefinition?: AnonCredsRevocationRegistryDefinition;
  revocationRegistryDefinitionId?: string;
}

export interface RegisterRevocationRegistryDefinitionReturnStateFinished extends AnonCredsOperationStateFinished {
  revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
  revocationRegistryDefinitionId: string;
}

export interface RegisterRevocationRegistryDefinitionReturn {
  jobId?: string;
  revocationRegistryDefinitionState:
    | RegisterRevocationRegistryDefinitionReturnStateWait
    | RegisterRevocationRegistryDefinitionReturnStateAction
    | RegisterRevocationRegistryDefinitionReturnStateFailed
    | RegisterRevocationRegistryDefinitionReturnStateFinished;
  revocationRegistryDefinitionMetadata: Extensible;
  registrationMetadata: Extensible;
}
