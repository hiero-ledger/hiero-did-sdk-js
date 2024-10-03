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
  PreCreationData extends {} = {},
  PreCreationResult extends any = any,
  PreSigningData extends {} = {},
  PreSigningResult extends any = any,
  PostSigningData extends {} = {},
  PostSigningResult extends any = any,
  PostCreationData extends {} = {},
  PostCreationResult extends any = any
> {
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
   * Indicates if the DID message requires a signature or has a signature.
   */
  abstract get requiredSignature(): boolean;

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
  abstract signWith(signer: Signer): Promise<void> | void;

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

  abstract get initializeData(): PreCreationData;
  abstract get preSigningData(): PreSigningData;
  abstract get postSigningData(): PostSigningData;
  abstract get publishingData(): PostCreationData;

  abstract initialize(data: PreCreationResult): void | Promise<void>;
  abstract preSigning(data: PreSigningResult): void | Promise<void>;
  abstract postSigning(data: PostSigningResult): void | Promise<void>;
  abstract publishing(data: PostCreationResult): void | Promise<void>;
}

export type DIDMessageConstructor<Message extends DIDMessage> = {
  new (payload: any): Message;
  fromBytes(bytes: string): Message;
};
