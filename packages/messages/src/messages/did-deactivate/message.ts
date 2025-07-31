import { DIDError, DIDMessage, isHederaDID } from '@hiero-did-sdk/core';
import { DIDDeactivateMessageConstructor, MessageSerialized } from './interfaces';
import { Buffer } from 'buffer';

/**
 * A message to deactivate a DID.
 */
export class DIDDeactivateMessage extends DIDMessage {
  public readonly timestamp: Date;
  public readonly did: string;

  /**
   * Constructs a new instance of the `DIDDeactivateMessage` class.
   * @param payload - The message payload.
   */
  constructor(payload: DIDDeactivateMessageConstructor) {
    super();

    if (!isHederaDID(payload.did)) {
      throw new DIDError('invalidDid', 'The DID must be a valid Hedera DID');
    }

    this.did = payload.did;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
  }

  /**
   * Gets the operation of the message.
   */
  get operation(): 'delete' {
    return 'delete';
  }

  /**
   * Gets the topic ID of the message.
   */
  get topicId(): string {
    const parts = this.did.split('_');
    return parts[1];
  }

  /**
   * Gets the message payload of the message.
   */
  get message(): object {
    return {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: null,
    };
  }

  /**
   * Serializes the message to bytes.
   * @returns The serialized message bytes.
   */

  toBytes(): string {
    const data: MessageSerialized = {
      did: this.did,
      timestamp: this.timestamp.toISOString(),
      signature: this.signature ? Buffer.from(this.signature).toString('base64') : undefined,
    };

    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Deserializes the message from bytes.
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message instance.
   */
  static fromBytes(bytes: string): DIDDeactivateMessage {
    const data = JSON.parse(Buffer.from(bytes, 'base64').toString('utf8')) as MessageSerialized;

    return new DIDDeactivateMessage({
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature ? Buffer.from(data.signature, 'base64') : undefined,
    });
  }
}
