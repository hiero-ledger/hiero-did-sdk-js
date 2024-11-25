export interface DIDRemoveServiceMessageConstructor {
  /**
   * The ID of the service to remove, e.g. '#service-1'.
   */
  id: string;

  /**
   * The DID of the DID Document to remove the service from.
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
   * @remarks For the deserialization purpose
   */
  signature?: Uint8Array;
}

export interface MessageSerialized {
  id: string;
  did: string;
  timestamp: string;
  signature?: string;
}
