/**
 * Custom error for AnonCreds resolution metadata
 */
export class AnonCredsResolutionMetadataError extends Error {
  constructor(
    public error: string,
    message: string
  ) {
    super(message);
  }
}
