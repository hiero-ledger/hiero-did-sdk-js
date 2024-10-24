import bs58 from "bs58";
import { DIDMessage } from "../DIDMessage";
import { Signer } from "../Signer";

export interface DIDDeactivateMessageConstructor {
  did: string;
  timestamp?: Date;
  signature?: Uint8Array;
}

export class DIDDeactivateMessage extends DIDMessage {
  public readonly timestamp: Date;
  public readonly did: string;
  public signature?: Uint8Array;

  constructor(payload: DIDDeactivateMessageConstructor) {
    super();
    this.did = payload.did;
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
  }

  get operation(): "revoke" {
    return "revoke";
  }

  get topicId(): string {
    const parts = this.did.split("_");
    return parts[1];
  }

  get messageBytes(): Uint8Array {
    return new TextEncoder().encode(this.message);
  }

  get message(): string {
    const data = {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: null,
    };

    return Buffer.from(JSON.stringify(data)).toString("base64");
  }

  get payload(): string {
    if (!this.signature) {
      throw new Error("Signature is missing");
    }

    return JSON.stringify({
      message: JSON.parse(Buffer.from(this.message, "base64").toString("utf8")),
      signature: Buffer.from(this.signature).toString("base64"),
    });
  }

  public async signWith(signer: Signer): Promise<void> {
    const signature = await signer.sign(this.messageBytes);
    this.signature = signature;
  }

  public setSignature(signature: Uint8Array): void {
    this.signature = signature;
  }

  toBytes(): string {
    return Buffer.from(
      JSON.stringify({
        did: this.did,
        timestamp: this.timestamp.toISOString(),
        signature: this.signature
          ? bs58.encode(Buffer.from(this.signature))
          : undefined,
      })
    ).toString("base64");
  }

  static fromBytes(bytes: string): DIDDeactivateMessage {
    const data = JSON.parse(Buffer.from(bytes, "base64").toString("utf8"));

    return new DIDDeactivateMessage({
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature ? bs58.decode(data.signature) : undefined,
    });
  }
}
