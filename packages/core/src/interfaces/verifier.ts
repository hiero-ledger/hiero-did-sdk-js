import { PublicKeyInDer } from './public-key';

/**
 * A Verifier is an entity that can verify the validity of signatures and the messages.
 * Ed25519 is the only supported signature algorithm.
 */
export abstract class Verifier {
  /**
   * Get the public key of the verifier.
   *
   * @returns The public key.
   * @throws If the public key cannot be retrieved.
   * @remarks The public key is in der format.
   */
  abstract publicKey(): Promise<PublicKeyInDer> | PublicKeyInDer;

  /**
   * Verify a signature of a message.
   *
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  abstract verify(message: Uint8Array, signature: Uint8Array): Promise<boolean> | boolean;
}
