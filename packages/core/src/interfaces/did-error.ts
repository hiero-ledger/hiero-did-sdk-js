/**
 * ErrorCodes is an enumeration of all possible error codes that can be thrown by the SDK.
 */
export type ErrorCodes =
  | 'invalidDid'
  | 'invalidDidUrl'
  | 'methodNotSupported'
  | 'representationNotSupported'
  | 'invalidPublicKey'
  | 'invalidPublicKeyLength'
  | 'invalidPublicKeyType'
  | 'unsupportedPublicKeyType'
  | 'internalError'
  | 'notFound'
  | 'invalidSignature'
  | 'invalidMultibase'
  | 'invalidArgument';

/**
 * DIDError is the base class for all errors thrown by the SDK.
 */
export class DIDError extends Error {
  public readonly isDIDError: boolean = true;

  constructor(
    public readonly code: ErrorCodes,
    public readonly description: string,
  ) {
    super(description);
    this.name = 'DIDError';
  }
}
