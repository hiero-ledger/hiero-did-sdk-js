import { Publisher } from "../Publisher";
import { Signer } from "../Signer";

interface LifeCycleManager {
  start(
    message: DIDMessage,
    signer: Signer,
    publisher: Publisher
  ): Promise<void> | void;
}

export abstract class DIDMessage<
  InitializationData extends {} = {},
  InitializationResult extends any = any,
  SigningData extends {} = {},
  SigningResult extends any = any,
  PublishingData extends {} = {},
  PublishingResult extends any = any
> {
  abstract get stage(): "initialize" | "signing" | "publishing";
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
  protected abstract get event(): string;

  /**
   * The message payload that is ready to be committed to the ledger. This is a base64 encoded JSON string.
   */
  protected abstract get messagePayload(): string;

  /**
   * Sets the signature of the DID event.
   */
  abstract setSignature(signature: Uint8Array): void;

  /**
   * Sets the signature of the DID event.
   */
  abstract execute(
    signer: Signer,
    publisher: Publisher,
    lifecycle: LifeCycleManager
  ): Promise<void> | void;

  /**
   * Method to convert the DID message to bytes for a serialized representation. A base64 encoded string is returned.
   */
  abstract toBytes(): string;

  /**
   * Data that is required to specific stage of the DID message lifecycle.
   */
  abstract get initializeData(): InitializationData;
  abstract get signingData(): SigningData;
  abstract get publishingData(): PublishingData;

  /**
   * Methods that are called during the lifecycle of the DID message to perform specific operations.
   */
  abstract initialize(data: InitializationResult): void | Promise<void>;
  abstract signing(data: SigningResult): void | Promise<void>;
  abstract publishing(data: PublishingResult): void | Promise<void>;
}

export type DIDMessageConstructor<Message extends DIDMessage> = {
  new (payload: any): Message;
  fromBytes(bytes: string): Message;
};
