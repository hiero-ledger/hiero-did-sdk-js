import { DIDError } from '@hiero-did-sdk/core';
import { resolveDID, TopicReader } from '@hiero-did-sdk/resolver';

/**
 * Check if a DID exists on the network
 * @param did The DID to check
 * @returns True if the DID exists
 */
export async function checkDIDExists(did: string, topicReader?: TopicReader): Promise<boolean> {
  try {
    const resolvedDID = await resolveDID(did, 'application/did+json', {
      topicReader,
    });
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
