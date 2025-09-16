import { Signer as BaseSigner } from '@hiero-did-sdk/core';
import { SignerOptions } from './interfaces';
import { Buffer } from 'buffer';

/**
 * An implementation of the Signer interface that signs messages using Hashicorp Vault.
 * This class can be created using the `VaultSignerFactory` class.
 */
export class Signer extends BaseSigner {
  constructor(private readonly options: SignerOptions) {
    super();
  }

  /**
   * Get the public key of the signer.
   * @returns The public key in DER format.
   * @remarks The public key is used to verify the signature.
   */
  async publicKey(): Promise<string> {
    const key = await this.options.clientApi.getPublicKey(this.options.keyName);
    return key;
  }

  /**
   * Sign a message or any other data.
   * @param message The data to sign.
   * @returns The signature.
   */
  async sign(message: Uint8Array): Promise<Uint8Array> {
    const base64Message = Buffer.from(message).toString('base64');
    const signature = await this.options.clientApi.sign(this.options.keyName, base64Message);
    return Buffer.from(signature, 'base64');
  }

  /**
   * Verify a signature of a message.
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  async verify(message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    const base64Message = Buffer.from(message).toString('base64');
    const base64Signature = Buffer.from(signature).toString('base64');

    const isValid = await this.options.clientApi.verify(this.options.keyName, base64Message, base64Signature);

    return isValid;
  }
}
