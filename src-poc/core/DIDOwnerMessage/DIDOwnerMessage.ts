import { PublicKey } from "@hashgraph/sdk";
import bs58 from "bs58";
import {
  DIDOwnerMessageInitializationData,
  DIDOwnerMessageInitializationResult,
  DIDOwnerMessagePublishingData,
  DIDOwnerMessagePublishingResult,
  DIDOwnerMessageSigningData,
  DIDOwnerMessageSigningResult,
} from "./DIDOwnerMessageLifeCycle";
import { DIDMessage } from "../DIDMessage";
import { Signer } from "../Signer";
import { DIDOwnerMessageHederaDefaultLifeCycle } from "./DIDOwnerMessageHederaDefaultLifeCycle";
import { Publisher } from "../Publisher";

// TODO: Add to payload?
const hederaNetwork = "testnet";

interface DIDOwnerMessageConstructor {
  controller: string;
  publicKey: PublicKey;
  timestamp?: Date;
  signature?: Uint8Array;
  topicId?: string;
}

export class DIDOwnerMessage extends DIDMessage {
  public readonly controller: string;
  public readonly publicKey: PublicKey;
  public readonly timestamp: Date;
  public signature?: Uint8Array;
  public topicId?: string;
  public stage: "initialize" | "signing" | "publishing";

  constructor(payload: DIDOwnerMessageConstructor) {
    super();
    // Validate controller
    this.controller = payload.controller;
    this.publicKey = payload.publicKey;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.topicId = payload.topicId;
    this.stage = "initialize";
  }

  get operation(): "create" {
    return "create";
  }

  get did(): string {
    // Probably not the best way to encode the public key and not working
    const publicKeyBase58 = bs58.encode(this.publicKey.toBytes());
    return `did:hedera:${hederaNetwork}:${publicKeyBase58}_${this.topicId}`;
  }

  get eventBytes(): Uint8Array {
    return new TextEncoder().encode(this.event);
  }

  protected get event(): string {
    return JSON.stringify({
      DIDOwner: {
        id: `${this.did}#did-root-key`,
        type: "Ed25519VerificationKey2020",
        controller: this.controller,
        // TODO: change to publicKeyMultibase
        publicKeyMultibase: this.publicKey.toStringDer(),
      },
    });
  }

  protected get messagePayload(): string {
    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    return JSON.stringify({
      message: {
        timestamp: this.timestamp.toISOString(),
        operation: this.operation,
        did: this.did,
        event: Buffer.from(this.event).toString("base64"),
      },
      signature: Buffer.from(this.signature).toString("base64"),
    });
  }

  get initializeData(): DIDOwnerMessageInitializationData {
    return {
      controller: this.controller,
      publicKey: this.publicKey,
      timestamp: this.timestamp.toISOString(),
    };
  }

  get signingData(): DIDOwnerMessageSigningData {
    if (!this.topicId) {
      throw new Error("Topic ID is missing");
    }

    return {
      event: this.event,
      eventBytes: this.eventBytes,
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp.toISOString(),
    };
  }

  get publishingData(): DIDOwnerMessagePublishingData {
    if (!this.topicId) {
      throw new Error("Topic ID is missing");
    }

    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    return {
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp.toISOString(),
      signature: this.signature,
      message: this.messagePayload,
    };
  }

  async initialize(data: DIDOwnerMessageInitializationResult): Promise<void> {
    this.stage = "signing";
    this.topicId = data.topicId;
  }

  async signing(data: DIDOwnerMessageSigningResult): Promise<void> {
    this.stage = "publishing";
    this.setSignature(data.signature);
  }

  async publishing(data: DIDOwnerMessagePublishingResult): Promise<void> {
    // We don't need to do anything here
  }

  public setSignature(signature: Uint8Array): void {
    this.signature = signature;
  }

  toBytes(): string {
    const decoder = new TextDecoder("utf8");

    return Buffer.from(
      JSON.stringify({
        controller: this.controller,
        publicKey: this.publicKey.toStringRaw(),
        timestamp: this.timestamp.toISOString(),
        topicId: this.topicId,
        signature: this.signature ? btoa(decoder.decode(this.signature)) : "",
      })
    ).toString("base64");
  }

  async execute(
    signer: Signer,
    publisher: Publisher,
    lifecycle = DIDOwnerMessageHederaDefaultLifeCycle
  ): Promise<void> {
    await lifecycle.start(this, signer, publisher);
  }

  static fromBytes(bytes: string): DIDOwnerMessage {
    const encoder = new TextEncoder();
    const data = JSON.parse(Buffer.from(bytes, "base64").toString("utf8"));

    return new DIDOwnerMessage({
      controller: data.controller,
      publicKey: PublicKey.fromString(data.publicKey),
      timestamp: new Date(data.timestamp),
      topicId: data.topicId,
      signature: data.signature
        ? encoder.encode(atob(data.signature))
        : undefined,
    });
  }
}
