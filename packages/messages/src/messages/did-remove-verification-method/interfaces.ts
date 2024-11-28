import { VerificationMethodProperties } from '@swiss-digital-assets-institute/core';

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

export interface MessageSerialized {
  id: string;
  did: string;
  property: VerificationMethodProperties;
  timestamp: string;
  signature?: string;
}
