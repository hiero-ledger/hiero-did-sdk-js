import { PublicKey } from '@hashgraph/sdk';
import bs58 from 'bs58';
import { DIDMessage, Network, isHederaDID } from '@hashgraph-did-sdk/core';
import { DIDOwnerMessageConstructor, MessageSerialized } from './interfaces';
import { isTopicId } from '../../validators/is-topic-id';

/**
 * DIDOwnerMessage is a message that represents the creation of a DID Document.
 */
export class DIDOwnerMessage extends DIDMessage {
  public readonly publicKey: PublicKey;
  public readonly timestamp: Date;
  public network?: Network;
  public controller?: string;
  public _topicId?: string;

  /**
   * Constructs a new DIDOwnerMessage instance.
   * @param payload The payload to construct the message from.
   */
  constructor(payload: DIDOwnerMessageConstructor) {
    super();

    if (payload.controller && !isHederaDID(payload.controller)) {
      throw new Error('Controller is not a valid Hedera DID');
    }

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
   * Gets the message payload of the message.
   */
  get message(): object {
    const event = {
      DIDOwner: {
        id: `${this.did}#did-root-key`,
        type: 'Ed25519VerificationKey2020',
        controller: this.controllerDid,
        // TODO: change to publicKeyMultibase
        publicKeyMultibase: this.publicKey.toStringDer(),
      },
    };

    return {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: Buffer.from(JSON.stringify(event)).toString('base64'),
    };
  }

  /**
   * Sets the topic ID of the message.
   * @param topicId The topic ID to set.
   */
  setTopicId(topicId: string): void {
    if (!isTopicId(topicId)) {
      throw new Error('Topic ID is not a valid Hedera topic ID');
    }
    this._topicId = topicId;
  }

  /**
   * Sets the controller of the new DID.
   * @param controller The controller to set.
   */
  setController(controller: string): void {
    if (!isHederaDID(controller)) {
      throw new Error('Controller is not a valid Hedera DID');
    }

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
   * Serializes the message to bytes.
   * @returns The serialized message.
   */
  toBytes(): string {
    const data: MessageSerialized = {
      network: this.network,
      controller: this.controller,
      publicKey: this.publicKey.toStringRaw(),
      timestamp: this.timestamp.toISOString(),
      topicId: this._topicId,
      signature: this.signature
        ? Buffer.from(this.signature).toString('base64')
        : undefined,
    };

    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Deserializes the message from bytes.
   * @param bytes The bytes to deserialize.
   * @returns The deserialized message.
   */
  static fromBytes(bytes: string): DIDOwnerMessage {
    const data = JSON.parse(
      Buffer.from(bytes, 'base64').toString('utf8'),
    ) as MessageSerialized;

    return new DIDOwnerMessage({
      controller: data.controller,
      network: data.network as Network,
      publicKey: PublicKey.fromStringED25519(data.publicKey),
      timestamp: new Date(data.timestamp),
      topicId: data.topicId,
      signature: data.signature
        ? Buffer.from(data.signature, 'base64')
        : undefined,
    });
  }
}
