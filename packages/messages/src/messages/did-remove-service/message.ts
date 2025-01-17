import {
  DIDError,
  DIDMessage,
  isHederaDID,
} from '@swiss-digital-assets-institute/core';
import {
  DIDRemoveServiceMessageConstructor,
  MessageSerialized,
} from './interfaces';
import { isPropertyID } from '../../validators/id-property-id';

/**
 * A message to remove a service from a DID Document.
 */
export class DIDRemoveServiceMessage extends DIDMessage {
  public readonly did: string;
  public readonly timestamp: Date;
  public readonly id: string;

  /**
   * Constructs a new DIDRemoveVerificationMethodMessage.
   * @param payload The message payload.
   */
  constructor(payload: DIDRemoveServiceMessageConstructor) {
    super();

    if (!isHederaDID(payload.did)) {
      throw new DIDError('invalidDid', 'The DID must be a valid Hedera DID');
    }

    if (!isPropertyID(payload.id)) {
      throw new DIDError(
        'invalidArgument',
        'The ID must be a valid property ID',
      );
    }

    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.id = payload.id;
    this.did = payload.did;
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
   * Gets the message payload of the message.
   */
  get message(): object {
    const data = {
      Service: {
        id: `${this.did}${this.id}`,
      },
    };

    return {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: Buffer.from(JSON.stringify(data)).toString('base64'),
    };
  }

  /**
   * Serializes the message to a bytes.
   * @returns The serialized message.
   */
  toBytes(): string {
    const data: MessageSerialized = {
      id: this.id,
      did: this.did,
      timestamp: this.timestamp.toISOString(),
      signature: this.signature
        ? Buffer.from(this.signature).toString('base64')
        : undefined,
    };

    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Deserializes the message from bytes.
   * @param bytes The bytes of the message to deserialize.
   * @returns The deserialized message.
   */
  static fromBytes(bytes: string): DIDRemoveServiceMessage {
    const data = JSON.parse(
      Buffer.from(bytes, 'base64').toString('utf8'),
    ) as MessageSerialized;

    return new DIDRemoveServiceMessage({
      id: data.id,
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature
        ? Buffer.from(data.signature, 'base64')
        : undefined,
    });
  }
}
