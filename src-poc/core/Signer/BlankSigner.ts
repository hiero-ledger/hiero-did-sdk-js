import { PublicKey } from "@hashgraph/sdk";
import { Signer } from "./Signer.type";

class BlankSigner implements Signer {
  get publicKey(): PublicKey {
    throw new Error("Used a blank signer");
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    throw new Error("Used a blank signer");
  }
}

export { BlankSigner };
