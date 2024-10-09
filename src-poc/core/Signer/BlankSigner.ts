import { Signer } from "./Signer.type";

class BlankSigner implements Signer {
  publicKey(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    throw new Error("Used a blank signer");
  }
}

export { BlankSigner };
