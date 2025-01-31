import {
  DID_ROOT_KEY_ID,
  DIDDocument,
  DIDError,
  JsonLdDIDDocument,
  KeysUtility,
} from '@swiss-digital-assets-institute/core';

/**
 * Extracts the root key from the DID Document.
 * Extracted key is in multibase format.
 *
 * @param didDocument The DID Document to extract the root key from
 * @throws Error if the root key is not found
 * @returns The root key in multibase format
 */
export function getDIDRootKey(
  didDocument: DIDDocument | JsonLdDIDDocument,
): string {
  const verificationMethods = didDocument.verificationMethod;

  if (!verificationMethods) {
    throw new DIDError(
      'internalError',
      'DID root key not found in a DID Document',
    );
  }

  const didRootKeyVerificationMethod = verificationMethods.find(
    (verificationMethod) =>
      verificationMethod.id === DID_ROOT_KEY_ID ||
      verificationMethod.id === `${didDocument.id}${DID_ROOT_KEY_ID}`,
  );

  if (!didRootKeyVerificationMethod) {
    throw new DIDError(
      'internalError',
      'DID root key not found in a DID Document',
    );
  }

  if ('publicKeyMultibase' in didRootKeyVerificationMethod) {
    return didRootKeyVerificationMethod.publicKeyMultibase;
  }

  return KeysUtility.fromBase58(
    didRootKeyVerificationMethod.publicKeyBase58,
  ).toMultibase();
}
