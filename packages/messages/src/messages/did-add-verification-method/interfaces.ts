import { VerificationMethodProperties } from '@hiero-did-sdk/core';

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

export interface MessageSerialized {
  publicKeyMultibase: string;
  timestamp: string;
  controller: string;
  did: string;
  id: string;
  property: string;
  signature?: string;
}
