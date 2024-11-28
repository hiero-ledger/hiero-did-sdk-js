import { DIDDocument } from '@swiss-digital-assets-institute/core';
import { PrivateKey } from '@hashgraph/sdk';

export interface DeactivateDIDOptions {
  /**
   * The DID to deactivate
   */
  did: string;

  /**
   * The private key to use to sign the deactivate operation.
   * If Signer is provided, this field is ignored.
   */
  privateKey?: string | PrivateKey;
}

export interface DeactivateDIDResult {
  /**
   * The DID that was deactivated
   */
  did: string;

  /**
   * The updated DID document after deactivation
   */
  didDocument: DIDDocument;
}
