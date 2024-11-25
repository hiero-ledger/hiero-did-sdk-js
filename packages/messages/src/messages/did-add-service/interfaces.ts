export interface DIDAddServiceMessageConstructor {
  /**
   * The ID of the verification method or relationship to add, e.g. '#service-1'.
   */
  id: string;

  /**
   * The type of the service to add, e.g. 'VerifiableCredentialService'.
   */
  type: string;

  /**
   * The service endpoint to add. Should be a valid URL.
   */
  serviceEndpoint: string;

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
  id: string;
  timestamp: string;
  type: string;
  did: string;
  serviceEndpoint: string;
  signature?: string;
}
