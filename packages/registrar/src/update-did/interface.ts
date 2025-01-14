import {
  DIDDocument,
  VerificationMethodProperties,
} from '@swiss-digital-assets-institute/core';
import { PrivateKey } from '@hashgraph/sdk';
import { CommonRegistrarOptions } from '../interfaces/common-options';

export interface AddServiceOperation {
  /**
   * The operation to perform
   */
  operation: 'add-service';

  /**
   * The ID of the service, e.g. '#vcs'
   */
  id: string;

  /**
   * The type of service, e.g. 'VerifiableCredentialService'
   */
  type: string;

  /**
   * The service endpoint
   */
  serviceEndpoint: string;
}

export interface RemoveServiceOperation {
  /**
   * The operation to perform
   */
  operation: 'remove-service';

  /**
   * The ID of the service to remove, e.g. '#vcs'
   */
  id: string;
}

export interface AddVerificationMethodOperation {
  /**
   * The operation to perform
   */
  operation: 'add-verification-method';

  /**
   * The ID of the verification method, e.g. '#key-1'
   */
  id: string;

  /**
   * The name of the verification method or relationship to add, e.g. 'keyAgreement'
   */
  property: VerificationMethodProperties;

  /**
   * The controller of the verification method
   */
  controller?: string;

  /**
   * The public key of the verification method or relationship to add.
   * In multibase format.
   */
  publicKeyMultibase: string;
}

export interface RemoveVerificationMethodOperation {
  /**
   * The operation to perform
   */
  operation: 'remove-verification-method';

  /**
   * The ID of the verification method to remove, e.g. '#key-1'
   */
  id: string;
}

export type DIDUpdateOperation =
  | AddVerificationMethodOperation
  | AddServiceOperation
  | RemoveServiceOperation
  | RemoveVerificationMethodOperation;

export type DIDUpdateOperationsKeys = DIDUpdateOperation['operation'];

export interface UpdateDIDOptions extends CommonRegistrarOptions {
  /**
   * The DID to update
   */
  did: string;

  /**
   * The operations to perform.
   * A single operation or an array of operations.
   */
  updates: DIDUpdateOperation | Array<DIDUpdateOperation>;

  /**
   * The private key to use to sign the update operation.
   * If Signer is provided, this field is ignored.
   */
  privateKey?: string | PrivateKey;
}

export interface UpdateDIDResult {
  /**
   * The DID that was updated
   */
  did: string;

  /**
   * The updated DID document after the update
   */
  didDocument: DIDDocument;
}
