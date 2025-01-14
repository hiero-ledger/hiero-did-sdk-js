import {
  DIDDocument,
  Service,
  VerificationMethod,
} from '@swiss-digital-assets-institute/core';

/**
 * The result of a fragment search
 */
export interface FragmentSearchResult {
  /**
   * True if the id is found in the current DID document, false otherwise
   */
  found: boolean;

  /**
   * The verification method that was found
   * @remarks If the id is not found, this will be undefined
   */
  item?: VerificationMethod | Service;

  /**
   * The name of the property that was found
   * @remarks If the id is not found, this will be undefined
   */
  property?: Exclude<keyof DIDDocument, 'id' | 'controller'>;
}

/**
 * Search for a fragment in a DID document and return the result of the search
 * @param fragment The fragment to search for, eg `#key-1`
 * @param didDocument The current DID document
 * @returns The result of the search
 */
export function fragmentSearch(
  fragment: string,
  didDocument: DIDDocument,
): FragmentSearchResult {
  const documentPropertyKeys = Object.keys(
    didDocument,
  ) as (keyof DIDDocument)[];

  for (const key of documentPropertyKeys) {
    if (key === 'id' || key === 'controller') {
      continue;
    }

    const service = didDocument[key];

    if (typeof service === 'string') {
      continue;
    }

    for (const item of service) {
      if (typeof item === 'string') {
        continue;
      }

      if (item.id === fragment || item.id === `${didDocument.id}${fragment}`) {
        return {
          found: true,
          item: item,
          property: key,
        };
      }
    }
  }

  return {
    found: false,
  };
}
