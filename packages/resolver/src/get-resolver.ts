import {
  DIDDocument,
  DIDDocumentCbor,
  DIDResolution,
  JsonLdDIDDocument,
} from '@swiss-digital-assets-institute/core';
import { resolveDID } from './resolve-did';

async function resolveWrapper(
  did: string,
): Promise<DIDDocument | JsonLdDIDDocument | DIDDocumentCbor | DIDResolution> {
  return await resolveDID(
    did,
    'application/ld+json;profile="https://w3id.org/did-resolution"',
  );
}

/**
 * Get list of supported resolvers.
 * Hedera resolver is the only supported resolver.
 * @returns List of supported resolvers.
 */
export function getResolver(): { hedera: typeof resolveWrapper } {
  return { hedera: resolveWrapper };
}
