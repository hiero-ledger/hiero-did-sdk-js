import { PrivateKey } from '@hashgraph/sdk';
import { Signer as BaseSigner, DIDError } from '@hiero-did-sdk/core';
import { isEd25519DerPrivateKeyString, isEd25519PrivateKey } from './validators';

/**
 * An internal implementation of the Signer interface.
 * This implementation uses the Hedera PrivateKey class with Ed25519 algorithm.
 */
export class Signer extends BaseSigner {
  /**
   * The private key used for signing.
   */
  public readonly privateKey: PrivateKey;

  /**
   * Create a new Signer instance.
   * @param privateKeyOrDer The PrivateKey object or the private key in DER format.
   */
  constructor(privateKeyOrDer: string | PrivateKey) {
    super();

    if (typeof privateKeyOrDer === 'string') {
      if (!isEd25519DerPrivateKeyString(privateKeyOrDer)) {
        throw new DIDError('invalidArgument', 'Invalid private key format. Expected DER.');
      }

      this.privateKey = PrivateKey.fromStringDer(privateKeyOrDer);
    } else {
      this.privateKey = privateKeyOrDer;
    }

    if (!isEd25519PrivateKey(this.privateKey)) {
      throw new DIDError('invalidArgument', 'Invalid private key type. Expected ED25519.');
    }
  }

  /**
   * Get the public key of the signer.
   * @returns The public key in DER format.
   * @remarks The public key is used to verify the signature.
   */
  publicKey(): Promise<string> {
    const publicKey = this.privateKey.publicKey.toStringDer();
    return Promise.resolve(publicKey);
  }

  /**
   * Sign a message or any other data.
   * @param message The data to sign.
   * @returns The signature.
   */
  sign(message: Uint8Array): Promise<Uint8Array> {
    return Promise.resolve(this.privateKey.sign(message));
  }

  /**
   * Verify a signature of a message.
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  verify(message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return Promise.resolve(this.privateKey.publicKey.verify(message, signature));
  }

  /**
   * Generate a new Signer instance with a new random private key.
   * @returns A new Signer instance.
   */
  static generate(): Signer {
    const privateKey = PrivateKey.generateED25519();
    return new Signer(privateKey);
  }
}
