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
   * The event bytes that the DID message is associated with. Represents the event in bytes that can be signed.
   */
  abstract get eventBytes(): Uint8Array;

  /**
   * The event that the DID message is associated with. e.g. DIDOwner, DIDDocument, etc.
   * This is a base64 encoded JSON string that represents the event.
   */
  abstract get event(): string;

  /**
   * The message payload that is ready to be committed to the ledger. This is a base64 encoded JSON string.
   */
  abstract get messagePayload(): string;

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
