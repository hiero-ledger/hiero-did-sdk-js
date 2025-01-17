import { DIDError, Signer } from '@swiss-digital-assets-institute/core';
import { Signer as InternalSigner } from '@swiss-digital-assets-institute/signer-internal';
import { PrivateKey } from '@hashgraph/sdk';

/**
 * Extract the signer from the providers or create a new internal signer.
 * Internal signer is created with the provided private key.
 * If `autoCreate` parameter is true, a new internal signer is created with a random private key.
 * @param signer Signer instance
 * @param privateKey Private key in der string or PrivateKey instance
 * @param autoCreate If true, a new internal signer is created with a random private key
 * @throws If no signer or private key is provided and `autoCreate` is false
 * @returns The signer instance
 */
export function getSigner(
  signer?: Signer,
  privateKey?: string | PrivateKey,
  autoCreate = false,
): Signer {
  if (signer) {
    return signer;
  }

  if (privateKey) {
    return new InternalSigner(privateKey);
  }

  if (!autoCreate) {
    throw new DIDError(
      'invalidArgument',
      'Signer or private key is required to perform the operation',
    );
  }

  return InternalSigner.generate();
}
