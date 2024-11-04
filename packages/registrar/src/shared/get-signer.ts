import { Signer } from '@hashgraph-did-sdk/core';
import { InternalSigner } from '@hashgraph-did-sdk/signer-internal';
import { PrivateKey } from '@hashgraph/sdk';

/**
 * Extract the signer from the providers or create a new internal signer.
 * Internal signer
 *  is created with the provided private key.
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
    throw new Error('Missing signer or private key');
  }

  return InternalSigner.generate();
}
