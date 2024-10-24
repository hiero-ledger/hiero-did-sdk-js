import { DIDMessage } from "../DIDMessage";
import { VerificationMethodProperties } from "../Shared/Interfaces";
import { Signer } from "../Signer";

export interface DIDRemoveVerificationMethodMessageConstructor {
  id: string;
  did: string;
  property: VerificationMethodProperties;
  timestamp?: Date;
  signature?: Uint8Array;
}

export class DIDRemoveVerificationMethodMessage extends DIDMessage {
  public readonly did: string;
  public readonly property: VerificationMethodProperties;
  public readonly timestamp: Date;
  public readonly id: string;
  public signature?: Uint8Array;

  constructor(payload: DIDRemoveVerificationMethodMessageConstructor) {
    super();
    this.timestamp = payload.timestamp || new Date();
    this.signature = payload.signature;
    this.id = payload.id;
    this.did = payload.did;
    this.property = payload.property;
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
    const commonEventData = {
      id: `${this.did}${this.id}`,
    };

    let event: Record<string, any> = {};

    if (this.property === "verificationMethod") {
      event = {
        VerificationMethod: {
          ...commonEventData,
        },
      };
    } else {
      event = {
        VerificationRelationship: {
          ...commonEventData,
        },
      };
    }

    const data = {
      timestamp: this.timestamp.toISOString(),
      operation: this.operation,
      did: this.did,
      event: Buffer.from(JSON.stringify(event)).toString("base64"),
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
    const decoder = new TextDecoder("utf8");

    return Buffer.from(
      JSON.stringify({
        property: this.property,
        id: this.id,
        did: this.did,
        timestamp: this.timestamp.toISOString(),
        signature: this.signature ? btoa(decoder.decode(this.signature)) : "",
      })
    ).toString("base64");
  }

  static fromBytes(bytes: string): DIDRemoveVerificationMethodMessage {
    const encoder = new TextEncoder();
    const data = JSON.parse(Buffer.from(bytes, "base64").toString("utf8"));

    return new DIDRemoveVerificationMethodMessage({
      property: data.property,
      id: data.id,
      did: data.did,
      timestamp: new Date(data.timestamp),
      signature: data.signature
        ? encoder.encode(atob(data.signature))
        : undefined,
    });
  }
}
