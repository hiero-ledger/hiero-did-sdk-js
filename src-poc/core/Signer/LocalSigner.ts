import { PrivateKey } from "@hashgraph/sdk";
import { Signer } from "./Signer.type";

class LocalSigner implements Signer {
  public readonly privateKey: PrivateKey;

  constructor(privateKeyDer: string) {
    this.privateKey = PrivateKey.fromStringDer(privateKeyDer);
  }

  publicKey(): Promise<string> {
    return Promise.resolve(this.privateKey.publicKey.toString());
  }

  sign(message: Uint8Array): Uint8Array {
    return this.privateKey.sign(message);
  }

  static generate(): LocalSigner {
    const privateKey = PrivateKey.generate();
    return new LocalSigner(privateKey.toString());
  }
}

export { LocalSigner };
