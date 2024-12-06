import {
  DIDMessage,
  isEd25519PublicKey,
  isHederaDID,
  VerificationMethodProperties,
} from '@swiss-digital-assets-institute/core';
import {
  DIDAddVerificationMethodMessageConstructor,
  MessageSerialized,
} from './interfaces';
import { isPropertyID } from '../../validators/id-property-id';

/**
 * A message to add a verification method or relationship to a DID Document.
 */
export class DIDAddVerificationMethodMessage extends DIDMessage {
  public readonly did: string;
  public readonly publicKeyMultibase: string;
  public readonly timestamp: Date;
  public readonly controller: string;
  public readonly property: VerificationMethodProperties;
  public readonly id: string;

  /**
   * Constructs a new instance of the `DIDAddVerificationMethodMessage` class.
   * @param payload - The payload for the message.
   */
  constructor(payload: DIDAddVerificationMethodMessageConstructor) {
    super();

    if (!isHederaDID(payload.did)) {
      throw new Error('The DID must be a valid Hedera DID.');
    }

    if (!isHederaDID(payload.controller)) {
      throw new Error('The controller must be a valid Hedera DID.');
    }

    if (!isPropertyID(payload.id)) {
      throw new Error('The ID must be a valid property ID.');
    }

    if (isEd25519PublicKey(payload.publicKeyMultibase)) {
      throw new Error('Invalid length for the public key.');
    }

    this.controller = payload.controller;
    this.publicKeyMultibase = payload.publicKeyMultibase;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.property = payload.property;
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
    const commonEventData = {
      id: `${this.did}${this.id}`,
      type: 'Ed25519VerificationKey2020',
      controller: this.controller,
      publicKeyMultibase: this.publicKeyMultibase,
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
          relationshipType: this.property,
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
   * Serializes the message to bytes.
   *
   * @returns The serialized message.
   */
  toBytes(): string {
    const data: MessageSerialized = {
      publicKeyMultibase: this.publicKeyMultibase,
      controller: this.controller,
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
   *
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message instance.
   */
  static fromBytes(bytes: string): DIDAddVerificationMethodMessage {
    const data = JSON.parse(
      Buffer.from(bytes, 'base64').toString('utf8'),
    ) as MessageSerialized;

    return new DIDAddVerificationMethodMessage({
      publicKeyMultibase: data.publicKeyMultibase,
      controller: data.controller,
      property: data.property as VerificationMethodProperties,
      id: data.id,
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature
        ? Buffer.from(data.signature, 'base64')
        : undefined,
    });
  }
}
