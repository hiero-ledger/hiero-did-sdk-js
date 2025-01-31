import { DIDError } from '@swiss-digital-assets-institute/core';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';

/**
 * Check if a DID exists on the network
 * @param did The DID to check
 * @returns True if the DID exists
 */
export async function checkDIDExists(did: string): Promise<boolean> {
  try {
    const resolvedDID = await resolveDID(did);
    return !!resolvedDID;
  } catch (error) {
    if (isDidNotFoundError(error)) {
      return false;
    }
    throw error;
  }
}

/**
 * Check if the error is a DID not found error
 * @param error The object to check
 * @returns True if the error is a DID not found error
 */
const isDidNotFoundError = (error: unknown): error is Error => {
  return error instanceof DIDError && error.code === 'notFound';
};
