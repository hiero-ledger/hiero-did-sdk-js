import { DIDError } from '@swiss-digital-assets-institute/core';

/**
 * The key ID for the DID Document's root key.
 */
export const DID_ROOT_KEY_ID = '#did-root-key';

/**
 * The DID not found error.
 */
export const notFoundError = new DIDError(
  'notFound',
  'The DID document was not found',
);
