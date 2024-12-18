import { DIDDocument } from '@swiss-digital-assets-institute/core';

/**
 * Check if the id is already in the current DID document
 * @param id The id to check, eg `#key-1`
 * @param didDocument The current DID document
 * @returns True if the id is already in the current DID document, false otherwise
 */
export function haveId(id: string, didDocument: DIDDocument): boolean {
  const documentPropertyKeys = Object.keys(
    didDocument,
  ) as (keyof DIDDocument)[];

  for (const key of documentPropertyKeys) {
    const service = didDocument[key];

    if (typeof service === 'string') {
      continue;
    }

    for (const item of service) {
      if (typeof item === 'string') {
        continue;
      }

      if (item.id === id || item.id === `${didDocument.id}${id}`) {
        return true;
      }
    }
  }

  return false;
}
