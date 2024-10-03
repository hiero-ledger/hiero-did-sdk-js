import { PublicKey } from "@hashgraph/sdk";

export abstract class Signer {
  abstract get publicKey(): PublicKey;
  abstract sign(message: Uint8Array): Promise<Uint8Array> | Uint8Array;
}
