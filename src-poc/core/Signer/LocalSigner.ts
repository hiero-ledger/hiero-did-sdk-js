import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import { Signer } from "./Signer.type";

class LocalSigner implements Signer {
  private _privateKey: PrivateKey;

  constructor(privateKeyDer: string) {
    this._privateKey = PrivateKey.fromStringDer(privateKeyDer);
  }

  get publicKey(): PublicKey {
    return this._privateKey.publicKey;
  }

  sign(message: Uint8Array): Uint8Array {
    return this._privateKey.sign(message);
  }
}

export { LocalSigner };
