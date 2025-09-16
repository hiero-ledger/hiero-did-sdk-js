import { PublicKeyInDer } from './public-key';
import { PublicKey, Transaction } from '@hashgraph/sdk';
import { KeysUtility } from '../utils';

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
  abstract sign(data: Uint8Array): Promise<Uint8Array>;

  /**
   * Get the public key of the signer.
   *
   * @returns The public key.
   * @throws If the public key cannot be retrieved.
   * @remarks The public key is in der format.
   * @remarks The public key is used to verify the signature.
   */
  abstract publicKey(): Promise<PublicKeyInDer>;

  /**
   * Verify a signature of a message.
   *
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  abstract verify(message: Uint8Array, signature: Uint8Array): Promise<boolean>;

  /**
   * Get the public key as a PublicKey instance from @hashgraph/sdk.
   *
   * @returns The public key as a PublicKey instance.
   * @throws If the public key cannot be retrieved.
   * @remarks Converts the DER format public key to a PublicKey instance.
   */
  async publicKeyInstance(): Promise<PublicKey> {
    const publicKeyDer = await this.publicKey();
    return KeysUtility.fromDerString(publicKeyDer).toPublicKey();
  }

  /**
   * Sign a Hedera transaction using the signer's private key.
   *
   * @param transaction The transaction to sign.
   * @returns The signed transaction.
   * @throws If the public key cannot be retrieved or if signing fails.
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const publicKey = await this.publicKeyInstance();
    return transaction.signWith(publicKey, (payload: Uint8Array) => this.sign(payload));
  }
}
