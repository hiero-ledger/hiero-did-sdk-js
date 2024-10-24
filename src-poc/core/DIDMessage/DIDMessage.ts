import { Signer } from "../Signer";

export abstract class DIDMessage {
  /**
   * The operation that the DID message is performing.
   */
  abstract get operation(): "create" | "update" | "revoke";

  /**
   * The DID that the message is associated with.
   */
  abstract get did(): string;

  /**
   * The event that the DID message is associated with. e.g. DIDOwner, DIDDocument, etc. and message structure.
   * This is a base64 encoded JSON string that represents the event in bytes.
   * This is used to sign the message.
   */
  abstract get messageBytes(): Uint8Array;

  /**
   * The event that the DID message is associated with. e.g. DIDOwner, DIDDocument, etc. and message structure.
   * This is a base64 encoded JSON string that represents the event.
   */
  abstract get message(): string;

  /**
   * The envelope of the wrapped message and signature.
   */
  abstract get payload(): string;

  /**
   * The topic ID that the DID message is associated with.
   */
  abstract get topicId(): string;

  /**
   * Sign the DID message with the provided signer.
   */
  abstract signWith(signer: Signer): void | Promise<void>;

  /**
   * Set the signature of the DID message.
   */
  abstract setSignature(signature: Uint8Array): void;

  /**
   * Method to convert the DID message to bytes for a serialized representation. A base64 encoded string is returned.
   */
  abstract toBytes(): string;
}

export type DIDMessageConstructor<Message extends DIDMessage> = {
  new (payload: any): Message;
  fromBytes(bytes: string): Message;
};
