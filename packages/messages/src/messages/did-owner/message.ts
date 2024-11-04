/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Above lines are added because of the serialization and deserialization issues

import { PublicKey } from '@hashgraph/sdk';
import bs58 from 'bs58';
import { Signer, DIDMessage, Network } from '@hashgraph-did-sdk/core';

export interface DIDOwnerMessageConstructor {
  /**
   * The public key of the DID owner root key.
   * This key is used to sign the DID messages.
   */
  publicKey: PublicKey;

  /**
   * The network of the DID.
   * Optional and can be set later.
   */
  network?: Network;

  /**
   * The controller of the DID.
   * Optional and can be set later.
   * @default The DID itself.
   */
  controller?: string;

  /**
   * The topic ID of the message.
   * Optional and can be set later.
   */
  topicId?: string;

  /**
   * The timestamp of the message.
   * @default new Date()
   * @remarks For the deserialization purpose.
   */
  timestamp?: Date;

  /**
   * The signature of the message.
   * @remarks For the deserialization purpose
   */
  signature?: Uint8Array;
}

/**
 * DIDOwnerMessage is a message that represents the creation of a DID Document.
 */
export class DIDOwnerMessage extends DIDMessage {
  public readonly publicKey: PublicKey;
  public readonly timestamp: Date;
  public network?: Network;
  public controller?: string;
  public signature?: Uint8Array;
  public _topicId?: string;

  /**
   * Constructs a new DIDOwnerMessage instance.
   * @param payload The payload to construct the message from.
   */
  constructor(payload: DIDOwnerMessageConstructor) {
    super();
    // Validate controller
    this.controller = payload.controller;
    this.network = payload.network;
    this.publicKey = payload.publicKey;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this._topicId = payload.topicId;
  }

  /**
   * Gets the operation of the message.
   */
  get operation(): 'create' {
    return 'create';
  }

  /**
   * Indicates whether the message has already set a topic ID.
   */
  get hasTopicId(): boolean {
    return !!this._topicId;
  }

  /**
   * Gets the topic ID of the message.
   * @throws If the topic ID is missing.
   */
  get topicId(): string {
    if (!this._topicId) {
      throw new Error('Topic ID is missing');
    }

    return this._topicId;
  }

  /**
   * Gets the DID of the message.
   */
  get did(): string {
    if (!this.network) {
      throw new Error('Network is missing');
    }

    // TODO: fix
    // Probably not the best way to encode the public key and not working
    const publicKeyBase58 = bs58.encode(this.publicKey.toBytes());
    return `did:hedera:${this.network}:${publicKeyBase58}_${this.topicId}`;
  }

  /**
   * Gets the controller DID of the message.
   */
  get controllerDid(): string {
    return this.controller ?? this.did;
  }

  /**
   * Gets the message bytes of the message.
   * This is used to sign the message.
   */
  get messageBytes(): Uint8Array {
    return new TextEncoder().encode(this.message);
  }

  /**
   * Gets the message payload of the message.
   */
  get message(): string {
    const event = {
      DIDOwner: {
        id: `${this.did}#did-root-key`,
        type: 'Ed25519VerificationKey2020',
        controller: this.controllerDid,
        // TODO: change to publicKeyMultibase
        publicKeyMultibase: this.publicKey.toStringDer(),
      },
    };

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
   * Sets the topic ID of the message.
   * @param topicId The topic ID to set.
   */
  setTopicId(topicId: string): void {
    // TODO: validate topic ID
    this._topicId = topicId;
  }

  /**
   * Sets the controller of the new DID.
   * @param controller The controller to set.
   */
  setController(controller: string): void {
    // TODO: validate controller
    this.controller = controller;
  }

  /**
   * Sets the network of the new DID.
   * @param network The network to set.
   */
  setNetwork(network: Network): void {
    this.network = network;
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

  // TODO: Fix serialization
  /**
   * Serializes the message to bytes.
   * @returns The serialized message.
   */
  toBytes(): string {
    const decoder = new TextDecoder('utf8');

    return Buffer.from(
      JSON.stringify({
        network: this.network,
        controller: this.controllerDid,
        publicKey: this.publicKey.toStringRaw(),
        timestamp: this.timestamp.toISOString(),
        topicId: this.topicId,
        signature: this.signature ? btoa(decoder.decode(this.signature)) : '',
      }),
    ).toString('base64');
  }

  // TODO: Fix deserialization
  /**
   * Deserializes the message from bytes.
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message.
   */
  static fromBytes(bytes: string): DIDOwnerMessage {
    const encoder = new TextEncoder();
    const data = JSON.parse(Buffer.from(bytes, 'base64').toString('utf8'));

    return new DIDOwnerMessage({
      controller: data.controller,
      network: data.network,
      publicKey: PublicKey.fromString(data.publicKey),
      timestamp: new Date(data.timestamp),
      topicId: data.topicId,
      signature: data.signature
        ? encoder.encode(atob(data.signature))
        : undefined,
    });
  }
}
