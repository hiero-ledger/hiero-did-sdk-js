import { PrivateKey } from "@hashgraph/sdk";
import { Signer } from "./Signer.type";

class LocalSigner implements Signer {
  private _privateKey: PrivateKey;

  constructor(privateKeyDer?: string) {
    this._privateKey = privateKeyDer
      ? PrivateKey.fromStringDer(privateKeyDer)
      : PrivateKey.generate();
  }

  publicKey(): Promise<string> {
    return Promise.resolve(this._privateKey.publicKey.toString());
  }

  sign(message: Uint8Array): Uint8Array {
    return this._privateKey.sign(message);
  }
}

export { LocalSigner };
