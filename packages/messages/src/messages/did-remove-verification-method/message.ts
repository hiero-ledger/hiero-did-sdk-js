import {
  VerificationMethodProperties,
  DIDMessage,
  isHederaDID,
} from '@swiss-digital-assets-institute/core';
import {
  DIDRemoveVerificationMethodMessageConstructor,
  MessageSerialized,
} from './interfaces';
import { isPropertyID } from '../../validators/id-property-id';

/**
 * A message to remove a verification method or relationship from a DID Document.
 */
export class DIDRemoveVerificationMethodMessage extends DIDMessage {
  public readonly did: string;
  public readonly property: VerificationMethodProperties;
  public readonly timestamp: Date;
  public readonly id: string;

  /**
   * Constructs a new DIDRemoveVerificationMethodMessage.
   * @param payload The message payload.
   */
  constructor(payload: DIDRemoveVerificationMethodMessageConstructor) {
    super();

    if (!isHederaDID(payload.did)) {
      throw new Error('The DID must be a valid Hedera DID.');
    }

    if (!isPropertyID(payload.id)) {
      throw new Error('The ID must be a valid property ID.');
    }

    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.id = payload.id;
    this.did = payload.did;
    this.property = payload.property;
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
    const commonEventData = {
      id: `${this.did}${this.id}`,
    };

    let event: object = {};

    if (this.property === 'verificationMethod') {
      event = {
        VerificationMethod: {
          ...commonEventData,
        },
      };
    } else {
      event = {
        VerificationRelationship: {
          ...commonEventData,
        },
      };
    }

    return {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: Buffer.from(JSON.stringify(event)).toString('base64'),
    };
  }

  /**
   * Serializes the message to a bytes.
   * @returns The serialized message.
   */
  toBytes(): string {
    const data: MessageSerialized = {
      property: this.property,
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
  static fromBytes(bytes: string): DIDRemoveVerificationMethodMessage {
    const data = JSON.parse(
      Buffer.from(bytes, 'base64').toString('utf8'),
    ) as MessageSerialized;

    return new DIDRemoveVerificationMethodMessage({
      property: data.property,
      id: data.id,
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature
        ? Buffer.from(data.signature, 'base64')
        : undefined,
    });
  }
}
