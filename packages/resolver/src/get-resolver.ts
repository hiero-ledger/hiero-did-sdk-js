import {
  DIDDocument,
  DIDDocumentCbor,
  DIDResolution,
  JsonLdDIDDocument,
} from '@hashgraph-did-sdk/core';
import { resolveDID } from './resolve-did';

async function resolveWrapper(
  did: string,
  _: unknown,
  __: unknown,
  options: { accept: string },
): Promise<DIDDocument | JsonLdDIDDocument | DIDDocumentCbor | DIDResolution> {
  return await resolveDID(did, options.accept as never);
}

/**
 * Get list of supported resolvers.
 * Hedera resolver is the only supported resolver.
 * @returns List of supported resolvers.
 */
export function getResolver(): { hedera: typeof resolveWrapper } {
  return { hedera: resolveWrapper };
}
