import { AnonCredsRevocationStatusList } from '../specification';
import {
  AnonCredsOperationStateAction,
  AnonCredsOperationStateFailed,
  AnonCredsOperationStateFinished,
  AnonCredsOperationStateWait,
  AnonCredsResolutionMetadata,
  Extensible,
  Optional,
} from './base';
import { Signer } from '@hiero-did-sdk/core';

export interface GetRevocationStatusListReturn {
  revocationStatusList?: AnonCredsRevocationStatusList;
  resolutionMetadata: AnonCredsResolutionMetadata;
  revocationStatusListMetadata: Extensible;
}

export type AnonCredsRevocationStatusListWithoutTimestamp = Omit<AnonCredsRevocationStatusList, 'timestamp'>;

export type AnonCredsRevocationStatusListWithOptionalTimestamp = Optional<AnonCredsRevocationStatusList, 'timestamp'>;

export interface RegisterRevocationStatusListOptions {
  revocationStatusList: AnonCredsRevocationStatusListWithoutTimestamp;
  issuerKeySigner: Signer;
}

export interface RegisterRevocationStatusListReturnStateAction extends AnonCredsOperationStateAction {
  revocationStatusList: AnonCredsRevocationStatusListWithOptionalTimestamp;
}

export interface RegisterRevocationStatusListReturnStateFailed extends AnonCredsOperationStateFailed {
  revocationStatusList?: AnonCredsRevocationStatusListWithOptionalTimestamp;
}

export interface RegisterRevocationStatusListReturnStateWait extends AnonCredsOperationStateWait {
  revocationStatusList?: AnonCredsRevocationStatusListWithOptionalTimestamp;
}

export interface RegisterRevocationStatusListReturnStateFinished extends AnonCredsOperationStateFinished {
  revocationStatusList: AnonCredsRevocationStatusList;
}

export interface RegisterRevocationStatusListReturn {
  jobId?: string;
  revocationStatusListState:
    | RegisterRevocationStatusListReturnStateWait
    | RegisterRevocationStatusListReturnStateAction
    | RegisterRevocationStatusListReturnStateFailed
    | RegisterRevocationStatusListReturnStateFinished;
  revocationStatusListMetadata: Extensible;
  registrationMetadata: Extensible;
}
