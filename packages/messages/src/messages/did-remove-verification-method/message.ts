/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Above lines are added because of the serialization and deserialization issues

import {
  Signer,
  VerificationMethodProperties,
  DIDMessage,
} from '@hashgraph-did-sdk/core';

export interface DIDRemoveVerificationMethodMessageConstructor {
  /**
   * The ID of the verification method or relationship to remove, e.g. '#key-1'.
   */
  id: string;

  /**
   * The DID of the DID Document to remove the verification method or relationship from.
   */
  did: string;

  /**
   * The property name of the verification method or relationship to remove, e.g. 'verificationMethod' or 'assertionMethod'.
   */
  property: VerificationMethodProperties;

  /**
   * The timestamp of the message.
   * @remarks For the deserialization purpose.
   * @default new Date()
   */
  timestamp?: Date;

  /**
   * The signature of the message.
   * @remarks For the deserialization purpose
   */
  signature?: Uint8Array;
}

/**
 * A message to remove a verification method or relationship from a DID Document.
 */
export class DIDRemoveVerificationMethodMessage extends DIDMessage {
  public readonly did: string;
  public readonly property: VerificationMethodProperties;
  public readonly timestamp: Date;
  public readonly id: string;
  public signature?: Uint8Array;

  /**
   * Constructs a new DIDRemoveVerificationMethodMessage.
   * @param payload The message payload.
   */
  constructor(payload: DIDRemoveVerificationMethodMessageConstructor) {
    super();
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
   * Gets the message bytes of the message.
   * This is used for signing the message.
   */
  get messageBytes(): Uint8Array {
    return new TextEncoder().encode(this.message);
  }

  /**
   * Gets the message payload of the message.
   */
  get message(): string {
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

    const data = {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: Buffer.from(JSON.stringify(event)).toString('base64'),
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
   * Signs the message with the given signer.
   * @param signer The signer to sign the message with.
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
   * Serializes the message to a bytes.
   * @returns The serialized message.
   */
  // TODO: fix serialization
  toBytes(): string {
    const decoder = new TextDecoder('utf8');

    return Buffer.from(
      JSON.stringify({
        property: this.property,
        id: this.id,
        did: this.did,
        timestamp: this.timestamp.toISOString(),
        signature: this.signature ? btoa(decoder.decode(this.signature)) : '',
      }),
    ).toString('base64');
  }

  // TODO: fix deserialization
  /**
   * Deserializes the message from bytes.
   * @param bytes The bytes of the message to deserialize.
   * @returns The deserialized message.
   */
  static fromBytes(bytes: string): DIDRemoveVerificationMethodMessage {
    const encoder = new TextEncoder();
    const data = JSON.parse(Buffer.from(bytes, 'base64').toString('utf8'));

    return new DIDRemoveVerificationMethodMessage({
      property: data.property,
      id: data.id,
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature
        ? encoder.encode(atob(data.signature))
        : undefined,
    });
  }
}
