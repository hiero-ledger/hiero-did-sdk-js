/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Above lines are added because of deserialization/serialization issues

import bs58 from 'bs58';
import { DIDMessage, Signer } from '@hashgraph-did-sdk/core';

export interface DIDDeactivateMessageConstructor {
  /**
   * The DID to deactivate.
   */
  did: string;

  /**
   * The timestamp of the message.
   * @remarks For the deserialization purpose.
   * @default new Date()
   */
  timestamp?: Date;

  /**
   * The signature of the message.
   * @remarks For the deserialization purpose.
   */
  signature?: Uint8Array;
}

/**
 * A message to deactivate a DID.
 */
export class DIDDeactivateMessage extends DIDMessage {
  public readonly timestamp: Date;
  public readonly did: string;
  public signature?: Uint8Array;

  /**
   * Constructs a new instance of the `DIDDeactivateMessage` class.
   * @param payload - The message payload.
   */
  constructor(payload: DIDDeactivateMessageConstructor) {
    super();
    this.did = payload.did;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
  }

  /**
   * Gets the operation of the message.
   */
  get operation(): 'revoke' {
    return 'revoke';
  }

  /**
   * Gets the topic ID of the message.
   */
  get topicId(): string {
    const parts = this.did.split('_');
    return parts[1];
  }

  /**
   * Gets the message bytes. This is used for signing the message.
   */
  get messageBytes(): Uint8Array {
    return new TextEncoder().encode(this.message);
  }

  /**
   * Gets the message payload of the message.
   */
  get message(): string {
    const data = {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: null,
    };

    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Gets the payload of the message.
   * This is used for submitting the message to the HCS topic.
   * The payload is a JSON string that contains the message and the signature.
   *
   * @throws Thrown if the signature is missing.
   * @returns The payload of the message.
   */
  get payload(): string {
    if (!this.signature) {
      throw new Error('Signature is missing');
    }

    return JSON.stringify({
      message: JSON.parse(Buffer.from(this.message, 'base64').toString('utf8')),
      signature: Buffer.from(this.signature).toString('base64'),
    });
  }

  /**
   * Signs the message with the specified signer.
   * @param signer The signer to use.
   */
  public async signWith(signer: Signer): Promise<void> {
    const signature = await signer.sign(this.messageBytes);
    this.signature = signature;
  }

  /**
   * Sets the signature of the message.
   * @param signature The signature to set.
   */
  public setSignature(signature: Uint8Array): void {
    this.signature = signature;
  }

  /**
   * Serializes the message to bytes.
   * @returns The serialized message bytes.
   */
  // TODO: fix serialization
  toBytes(): string {
    return Buffer.from(
      JSON.stringify({
        did: this.did,
        timestamp: this.timestamp.toISOString(),
        signature: this.signature
          ? bs58.encode(Buffer.from(this.signature))
          : undefined,
      }),
    ).toString('base64');
  }

  // TODO: fix deserialization
  /**
   * Deserializes the message from bytes.
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message instance.
   */
  static fromBytes(bytes: string): DIDDeactivateMessage {
    const data = JSON.parse(Buffer.from(bytes, 'base64').toString('utf8'));

    return new DIDDeactivateMessage({
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature ? bs58.decode(data.signature) : undefined,
    });
  }
}
