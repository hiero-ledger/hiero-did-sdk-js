import { DIDError } from '@swiss-digital-assets-institute/core';

/**
 * The DID not found error.
 */
export const notFoundError = new DIDError(
  'notFound',
  'The DID document was not found',
);
