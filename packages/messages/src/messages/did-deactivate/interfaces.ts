export interface DIDDeactivateMessageConstructor {
  /**
   * The DID to deactivate.
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
  did: string;
  timestamp: string;
  signature?: string;
}
