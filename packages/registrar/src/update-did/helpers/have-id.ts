import { DIDDocument } from '@swiss-digital-assets-institute/core';
import { fragmentSearch } from './fragment-search';

/**
 * Check if the id is already in the current DID document
 * @param id The id to check, eg `#key-1`
 * @param didDocument The current DID document
 * @returns True if the id is already in the current DID document, false otherwise
 */
export function haveId(id: string, didDocument: DIDDocument): boolean {
  const searchResult = fragmentSearch(id, didDocument);
  return searchResult.found;
}
