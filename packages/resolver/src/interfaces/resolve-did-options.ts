import { Verifier } from '@swiss-digital-assets-institute/core';

export interface ResolveDIDOptions {
  /**
   * A custom verifier to use when verifying the DID document signature.
   * If not specified, the verification with root key will be used from the DID document.
   */
  verifier?: Verifier;
}

export interface GetResolveDIDOptions extends ResolveDIDOptions {
  /**
   * A custom verifier to use when verifying the DID document signature.
   * If not specified, the verification with root key will be used from the DID document.
   */
  verifier?: Verifier;
}

export type DereferenceDIDOptions = ResolveDIDOptions;
