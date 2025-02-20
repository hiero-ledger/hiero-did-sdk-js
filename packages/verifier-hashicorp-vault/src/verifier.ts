import { Verifier as BaseVerifier } from '@swiss-digital-assets-institute/core';
import { VerifierOptions } from './interfaces';

/**
 * An implementation of the Verifier interface that verifies signatures using Hashicorp Vault.
 */
export class Verifier implements BaseVerifier {
  constructor(private readonly options: VerifierOptions) {}

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
   * Verify a signature of a message.
   * @param message The original message.
   * @param signature The signature to verify.
   * @returns True if the signature is valid, false otherwise.
   */
  async verify(message: Uint8Array, signature: Uint8Array): Promise<boolean> {
    const base64Message = Buffer.from(message).toString('base64');
    const base64Signature = Buffer.from(signature).toString('base64');

    const isValid = await this.options.clientApi.verify(
      this.options.keyName,
      base64Message,
      base64Signature,
    );

    return isValid;
  }
}
