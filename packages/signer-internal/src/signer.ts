import { PrivateKey } from '@hashgraph/sdk';
import { Signer } from '@hashgraph-did-sdk/core';

/**
 * An internal implementation of the Signer interface.
 * This implementation uses the Hedera PrivateKey class with Ed25519 algorithm.
 */
export class InternalSigner implements Signer {
  /**
   * The private key used for signing.
   */
  public readonly privateKey: PrivateKey;

  /**
   * Create a new InternalSigner instance.
   * @param privateKeyOrDer The PrivateKey object or the private key in DER format.
   */
  constructor(privateKeyOrDer: string | PrivateKey) {
    // TODO: verify if the private key is in DER format
    // TODO: verify if the private key is ed25519
    if (typeof privateKeyOrDer === 'string') {
      this.privateKey = PrivateKey.fromStringDer(privateKeyOrDer);
    } else {
      this.privateKey = privateKeyOrDer;
    }
  }

  /**
   * Get the public key of the signer.
   * @returns The public key in DER format.
   * @remarks The public key is used to verify the signature.
   */
  publicKey(): string {
    const publicKey = this.privateKey.publicKey.toStringDer();
    return publicKey;
  }

  /**
   * Sign a message or any other data.
   * @param message The data to sign.
   * @returns The signature.
   */
  sign(message: Uint8Array): Uint8Array {
    return this.privateKey.sign(message);
  }

  /**
   * Generate a new InternalSigner instance with a new random private key.
   * @returns A new InternalSigner instance.
   */
  static generate(): InternalSigner {
    const privateKey = PrivateKey.generateED25519();
    return new InternalSigner(privateKey);
  }
}
