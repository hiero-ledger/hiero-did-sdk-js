/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Above lines are added because of the serialization and deserialization issues

import {
  Signer,
  DIDMessage,
  VerificationMethodProperties,
} from '@hashgraph-did-sdk/core';

export interface DIDAddVerificationMethodMessageConstructor {
  /**
   * The Public Key Multibase of the verification method or relationship to add.
   */
  publicKeyMultibase: string;

  /**
   * The DID of the controller of the verification method or relationship.
   */
  controller: string;

  /**
   * The property name of the verification method or relationship to add, e.g. 'verificationMethod' or 'assertionMethod'.
   */
  property: VerificationMethodProperties;

  /**
   * The ID of the verification method or relationship to add, e.g. '#key-1'.
   */
  id: string;

  /**
   * The DID of the DID Document to add the verification method or relationship to.
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
 * A message to add a verification method or relationship to a DID Document.
 */
export class DIDAddVerificationMethodMessage extends DIDMessage {
  public readonly did: string;
  public readonly publicKeyMultibase: string;
  public readonly timestamp: Date;
  public readonly controller: string;
  public readonly property: VerificationMethodProperties;
  public readonly id: string;
  public signature?: Uint8Array;

  /**
   * Constructs a new instance of the `DIDAddVerificationMethodMessage` class.
   * @param payload - The payload for the message.
   */
  constructor(payload: DIDAddVerificationMethodMessageConstructor) {
    super();
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
   * Gets the DID of the controller of the verification method.
   */
  get controllerDid(): string {
    return this.controller ?? this.did;
  }

  /**
   * Gets the bytes of the message. This is used for signing the message.
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
   *
   * @param signer - The signer to sign the message
   * @returns A promise that resolves when the message is signed.
   */
  public async signWith(signer: Signer): Promise<void> {
    const signature = await signer.sign(this.messageBytes);
    this.signature = signature;
  }

  /**
   * Sets the signature of the message.
   *
   * @param signature - The signature to set.
   */
  public setSignature(signature: Uint8Array): void {
    this.signature = signature;
  }

  /**
   * Serializes the message to bytes.
   *
   * @returns The serialized message.
   */
  // TODO: fix serialization
  toBytes(): string {
    const decoder = new TextDecoder('utf8');

    return Buffer.from(
      JSON.stringify({
        publicKeyMultibase: this.publicKeyMultibase,
        controller: this.controller,
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
   *
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message instance.
   */
  static fromBytes(bytes: string): DIDAddVerificationMethodMessage {
    const encoder = new TextEncoder();
    const data = JSON.parse(Buffer.from(bytes, 'base64').toString('utf8'));

    return new DIDAddVerificationMethodMessage({
      publicKeyMultibase: data.publicKeyMultibase,
      controller: data.controller,
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
