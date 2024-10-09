type KeyId = string;
type PublicKeyInBase58 = string;

export abstract class Signer {
  abstract sign(message: Uint8Array): Promise<Uint8Array> | Uint8Array;
  abstract publicKey(): Promise<PublicKeyInBase58>;
}
