import { PrivateKey, PublicKey } from "@hashgraph/sdk";
import { Signer } from "./Signer.type";

interface KMSSignerConstructor {
  url: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

class KMSSigner {
  private _privateKey: PrivateKey;

  constructor(options: KMSSignerConstructor) {
    // TODO: Implement KMS signer
    this._privateKey = PrivateKey.generate();
  }

  for(keyId: string): Signer {
    return {
      sign: async (message: Uint8Array): Promise<Uint8Array> =>
        this._privateKey.sign(message),
      publicKey: async (): Promise<string> =>
        this._privateKey.publicKey.toString(),
    };
  }
}

export { KMSSigner };
