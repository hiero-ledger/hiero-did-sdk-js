import { PublicKeyInBase58 } from './public-key';

/**
 * A signer is an entity that can sign messages.
 * Ed25519 is the only supported signature algorithm.
 */
export abstract class Signer {
  /**
   * Sign a message or any other data.
   *
   * @param message The data to sign.
   * @returns The signature.
   */
  abstract sign(data: Uint8Array): Promise<Uint8Array> | Uint8Array;

  /**
   * Get the public key of the signer.
   *
   * @returns The public key.
   * @throws If the public key cannot be retrieved.
   * @remarks The public key is in base58 format.
   * @remarks The public key is used to verify the signature.
   */
  abstract publicKey(): Promise<PublicKeyInBase58> | PublicKeyInBase58;

  /**
   * Verify a signature of a message.
   *
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  abstract verify(
    message: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> | boolean;
}
