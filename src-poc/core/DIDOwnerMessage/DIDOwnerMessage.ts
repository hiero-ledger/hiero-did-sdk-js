import { PublicKey } from "@hashgraph/sdk";
import bs58 from "bs58";
import {
  DIDOwnerMessagePostCreationData,
  DIDOwnerMessagePostCreationResult,
  DIDOwnerMessagePostSigningData,
  DIDOwnerMessagePostSigningResult,
  DIDOwnerMessagePreCreationData,
  DIDOwnerMessagePreCreationResult,
  DIDOwnerMessagePreSigningData,
  DIDOwnerMessagePreSigningResult,
} from "./DIDOwnerMessageLifeCycle";
import { DIDMessage } from "../DIDMessage";
import { Signer } from "../Signer";
import { DIDOwnerMessageHederaDefaultLifeCycle } from "./DIDOwnerMessageHederaDefaultLifeCycle";
import { Publisher } from "../Publisher";
import { DIDMessageLifeCycleManager } from "../DIDMessage/DIDMessageLifeCycleManager";

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

  constructor(payload: DIDOwnerMessageConstructor) {
    super();
    // Validate controller
    this.controller = payload.controller;
    this.publicKey = payload.publicKey;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.topicId = payload.topicId;
  }

  get operation(): "create" {
    return "create";
  }

  get did(): string {
    // Probably not the best way to encode the public key and not working
    const publicKeyBase58 = bs58.encode(this.publicKey.toBytes());
    return `did:hedera:${hederaNetwork}:${publicKeyBase58}_${this.topicId}`;
  }

  get requiredSignature(): boolean {
    return !this.signature;
  }

  get eventBytes(): Uint8Array {
    return new TextEncoder().encode(this.event);
  }

  get initializeData(): DIDOwnerMessagePreCreationData {
    return {
      controller: this.controller,
      publicKey: this.publicKey,
      timestamp: this.timestamp.toISOString(),
    };
  }

  get preSigningData(): DIDOwnerMessagePreSigningData {
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

  get postSigningData(): DIDOwnerMessagePostSigningData {
    if (!this.topicId) {
      throw new Error("Topic ID is missing");
    }

    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    return {
      signature: this.signature,
      controller: this.controller,
      publicKey: this.publicKey,
      topicId: this.topicId,
      timestamp: this.timestamp.toISOString(),
      message: this.messagePayload,
    };
  }

  get publishingData(): DIDOwnerMessagePostCreationData {
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

  async initialize(data: DIDOwnerMessagePreCreationResult): Promise<void> {
    this.topicId = data.topicId;
  }

  async preSigning(data: DIDOwnerMessagePreSigningResult): Promise<void> {
    this.setSignature(data.signature);
  }

  async postSigning(data: DIDOwnerMessagePostSigningResult): Promise<void> {
    // TODO: Validate signature
  }

  async publishing(data: DIDOwnerMessagePostCreationResult): Promise<void> {
    // We don't need to do anything here
  }

  public setSignature(signature: Uint8Array): void {
    this.signature = signature;
  }

  public async signWith(signer: Signer): Promise<void> {
    if (!this.requiredSignature) {
      throw new Error("Signature is already set");
    }

    const signature = await signer.sign(this.eventBytes);
    this.setSignature(signature);
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
