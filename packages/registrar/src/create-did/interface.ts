import { DIDDocument } from '@swiss-digital-assets-institute/core';
import { PrivateKey } from '@hashgraph/sdk';

export interface CreateDIDOptions {
  /**
   * The controller of the DID. If not provided, the DID will be self-controlled.
   */
  controller?: string;

  /**
   * The topic ID to use for the DID. If not provided, the new topic will be created.
   */
  topicId?: string;

  /**
   * The private key to use for the DID.
   * If not provided, a new private key will be generated.
   * If a Signer is provided in the providers, this will be ignored.
   */
  privateKey?: string | PrivateKey;
}

export interface CreateDIDResult {
  /**
   * The DID that was created.
   */
  did: string;

  /**
   * The DID document that was created.
   */
  didDocument: DIDDocument;

  /**
   * The private key that was generated.
   */
  privateKey?: PrivateKey;
}
