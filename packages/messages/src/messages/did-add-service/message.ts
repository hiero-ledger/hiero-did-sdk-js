import { DIDMessage, isHederaDID } from '@swiss-digital-assets-institute/core';
import {
  DIDAddServiceMessageConstructor,
  MessageSerialized,
} from './interfaces';
import { isPropertyID } from '../../validators/id-property-id';
import { isURI } from '../../validators/is-uri';

/**
 * A message to add a service to a DID Document.
 */
export class DIDAddServiceMessage extends DIDMessage {
  public readonly did: string;
  public readonly type: string;
  public readonly serviceEndpoint: string;
  public readonly id: string;
  public readonly timestamp: Date;

  /**
   * Constructs a new instance of the `DIDAddServiceMessage` class.
   * @param payload - The payload for the message.
   */
  constructor(payload: DIDAddServiceMessageConstructor) {
    super();

    if (!isHederaDID(payload.did)) {
      throw new Error('The DID must be a valid Hedera DID.');
    }

    if (!isPropertyID(payload.id)) {
      throw new Error('The ID must be a valid property ID.');
    }

    if (!isURI(payload.serviceEndpoint)) {
      throw new Error('The service endpoint must be a valid URI.');
    }

    // Validate the service endpoint.
    this.type = payload.type;
    this.serviceEndpoint = payload.serviceEndpoint;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.id = payload.id;
    this.did = payload.did;
  }

  /**
   * Gets the operation of the message.
   */
  get operation(): 'update' {
    return 'update';
  }

  /**
   * Gets the topic ID for the message.
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
        type: this.type,
        serviceEndpoint: this.serviceEndpoint,
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
   * Serializes the message to bytes.
   *
   * @returns The serialized message.
   */
  toBytes(): string {
    const data: MessageSerialized = {
      type: this.type,
      serviceEndpoint: this.serviceEndpoint,
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
   *
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message instance.
   */
  static fromBytes(bytes: string): DIDAddServiceMessage {
    const data = JSON.parse(
      Buffer.from(bytes, 'base64').toString('utf8'),
    ) as MessageSerialized;

    return new DIDAddServiceMessage({
      serviceEndpoint: data.serviceEndpoint,
      type: data.type,
      id: data.id,
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature
        ? Buffer.from(data.signature, 'base64')
        : undefined,
    });
  }
}
