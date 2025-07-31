import { Network } from '@hiero-did-sdk/core';
import { PublicKey } from '@hashgraph/sdk';

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

export interface MessageSerialized {
  publicKey: string;
  timestamp: string;
  controller?: string;
  network?: string;
  topicId?: string;
  signature?: string;
}
