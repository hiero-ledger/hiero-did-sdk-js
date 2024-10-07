import { PublicKey } from "@hashgraph/sdk";
import bs58 from "bs58";
import { DIDMessage } from "../DIDMessage";
import { Signer } from "../Signer";

// TODO: Add to payload?
const hederaNetwork = "testnet";

export interface DIDOwnerMessageConstructor {
  publicKey: PublicKey;
  controller?: string;
  timestamp?: Date;
  signature?: Uint8Array;
  topicId?: string;
}

export class DIDOwnerMessage extends DIDMessage {
  public readonly publicKey: PublicKey;
  public readonly timestamp: Date;
  public controller?: string;
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

  get controllerDid(): string {
    return this.controller ?? this.did;
  }

  get eventBytes(): Uint8Array {
    return new TextEncoder().encode(this.event);
  }

  get event(): string {
    return JSON.stringify({
      DIDOwner: {
        id: `${this.did}#did-root-key`,
        type: "Ed25519VerificationKey2020",
        controller: this.controllerDid,
        // TODO: change to publicKeyMultibase
        publicKeyMultibase: this.publicKey.toStringDer(),
      },
    });
  }

  get messagePayload(): string {
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

  setTopicId(topicId: string): void {
    this.topicId = topicId;
  }

  setController(controller: string): void {
    this.controller = controller;
  }

  public async signWith(signer: Signer): Promise<void> {
    const signature = await signer.sign(this.eventBytes);
    this.signature = signature;
  }

  public setSignature(signature: Uint8Array): void {
    this.signature = signature;
  }

  toBytes(): string {
    const decoder = new TextDecoder("utf8");

    return Buffer.from(
      JSON.stringify({
        controller: this.controllerDid,
        publicKey: this.publicKey.toStringRaw(),
        timestamp: this.timestamp.toISOString(),
        topicId: this.topicId,
        signature: this.signature ? btoa(decoder.decode(this.signature)) : "",
      })
    ).toString("base64");
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
