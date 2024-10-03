import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import { Signer } from "./Signer.type";

interface KMSSignerConstructor {
  url: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

class KMSSigner implements Signer {
  private _privateKey: PrivateKey;

  constructor(options: KMSSignerConstructor) {
    // TODO: Implement KMS signer
    this._privateKey = PrivateKey.generate();
  }

  get publicKey(): PublicKey {
    return this._privateKey.publicKey;
  }

  async sign(message: Uint8Array): Promise<Uint8Array> {
    return this._privateKey.sign(message);
  }
}

export { KMSSigner };
