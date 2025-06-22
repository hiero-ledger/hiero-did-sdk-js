import { DIDError } from './did-error';
import { Signer } from './signer';
import { Verifier } from './verifier';

export type DIDMessageOperation = 'create' | 'update' | 'revoke' | 'delete';

/**
 * An abstract class that represents a DID message. This class is used to create, update, and revoke DIDs.
 */
export abstract class DIDMessage {
  /**
   * The signature of the message.
   */
  public signature?: Uint8Array;

  /**
   * The operation that the DID message is performing.
   */
  abstract get operation(): DIDMessageOperation;

  /**
   * The DID that the message is associated with.
   */
  abstract get did(): string;

  /**
   * The message object that the DID message is associated with. e.g. DIDOwner, DIDDocument, etc. and message structure.
   */
  abstract get message(): object;

  /**
   * The topic ID that the DID message is associated with.
   */
  abstract get topicId(): string;

  /**
   * Method to convert the DID message to bytes for a serialized representation. A base64 encoded string is returned.
   */
  abstract toBytes(): string;

  /**
   * A byte representation of the message.
   * It is a message object in JSON format that is converted to bytes.
   * This is used to sign the message
   */
  get messageBytes(): Uint8Array {
    return new TextEncoder().encode(JSON.stringify(this.message));
  }

  /**
   * Gets the envelope of the message including the message and the signature.
   * This is used for submitting the message to the HCS topic.
   * The payload is a JSON string that contains the message and the signature.
   *
   * @throws Thrown if the signature is missing.
   * @returns The payload of the message to be submitted to the HCS topic.
   */
  get payload(): string {
    if (!this.signature) {
      throw new DIDError(
        'invalidSignature',
        'DID message is missing a signature. Signature is required to construct a DID message payload.',
      );
    }

    return JSON.stringify({
      message: this.message,
      signature: Buffer.from(this.signature).toString('base64'),
    });
  }

  /**
   * Signs the message with the given signer.
   *
   * @param signer - The signer to sign the message
   * @param verifier - The verifier to verify the signature
   * @returns A promise that resolves when the message is signed.
   */
  public async signWith(signer: Signer, verifier: Verifier): Promise<void> {
    const signature = await signer.sign(this.messageBytes);
    const isValid = await verifier.verify(this.messageBytes, signature);

    if (!isValid) {
      throw new DIDError(
        'invalidSignature',
        'The signature is invalid. Provided signer does not match the DID signer.',
      );
    }

    this.signature = signature;
  }

  /**
   * Sets the signature of the message.
   *
   * @param signature The signature to set.
   * @param verifier The verifier class instance to verify the signature.
   */
  public async setSignature(
    signature: Uint8Array,
    verifier: Verifier,
  ): Promise<void> {
    const isValid = await verifier.verify(this.messageBytes, signature);

    if (!isValid) {
      throw new DIDError(
        'invalidSignature',
        'The signature is invalid. Provided signature does not match the DID signer.',
      );
    }

    this.signature = signature;
  }
}
