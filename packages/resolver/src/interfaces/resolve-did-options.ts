import { Signer } from '@hashgraph-did-sdk/core';

export interface ResolveDIDOptions {
  /**
   * A custom verifier to use when verifying the DID document signature.
   * If not specified, the verification with root key will be used from the DID document.
   */
  verifier?: Signer;
}

export interface GetResolveDIDOptions extends ResolveDIDOptions {
  /**
   * A custom verifier to use when verifying the DID document signature.
   * If not specified, the verification with root key will be used from the DID document.
   */
  verifier?: Signer;
}
