import { PublicKey } from '@hashgraph/sdk';
import {
  Verifier as BaseVerifier,
  DIDError,
  isEd25519PublicKey,
  KeysUtility,
} from '@swiss-digital-assets-institute/core';

/**
 * An internal implementation of the Verifier interface.
 * This implementation uses the Hedera PublicKey class with Ed25519 algorithm.
 */
export class Verifier implements BaseVerifier {
  /**
   * The private key used for signing.
   */
  public readonly verifierKey: PublicKey;

  /**
   * Create a new Verifier instance.
   *
   * @param publicKey The PublicKey object to use for verification.
   */
  constructor(publicKey: PublicKey) {
    const keyUtil = KeysUtility.fromPublicKey(publicKey);
    if (!isEd25519PublicKey(keyUtil.toMultibase())) {
      throw new DIDError(
        'invalidArgument',
        'Invalid public key type. Expected ED25519.',
      );
    }

    this.verifierKey = publicKey;
  }

  /**
   * Get the public key of the verifier.
   *
   * @returns The public key.
   * @throws If the public key cannot be retrieved.
   * @remarks The public key is in der format.
   */
  publicKey(): string {
    const publicKey = this.verifierKey.toStringDer();
    return publicKey;
  }

  /**
   * Verify a signature of a message.
   *
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  verify(message: Uint8Array, signature: Uint8Array): boolean {
    return this.verifierKey.verify(message, signature);
  }

  /**
   * Create a new Verifier instance from a multibase encoded public key.
   * @param multibase The multibase encoded public key.
   * @returns The new Verifier instance.
   */
  static fromMultibase(multibase: string): Verifier {
    const publicKey = KeysUtility.fromMultibase(multibase).toPublicKey();
    return new Verifier(publicKey);
  }

  /**
   * Create a new Verifier instance from a base58 encoded public key.
   * @param base58 The base58 encoded public key.
   * @returns The new Verifier instance.
   */
  static fromBase58(base58: string): Verifier {
    const publicKey = KeysUtility.fromBase58(base58).toPublicKey();
    return new Verifier(publicKey);
  }
}
