export type SigningRequestAlgorithm = 'Ed25519';

export interface SigningRequest {
  /**
   * The payload of the signing request.
   */
  payload: object;

  /**
   * The serialized payload of the signing request. Actual bytes to be signed.
   */
  serializedPayload: Uint8Array;

  /**
   * The public key in multibase format that must sign the request.
   */
  multibasePublicKey: string;

  /**
   * The algorithm used to sign the request.
   */
  alg: SigningRequestAlgorithm;
}
