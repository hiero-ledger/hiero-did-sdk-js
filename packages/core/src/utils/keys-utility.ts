import { PublicKey } from '@hashgraph/sdk';
import { base58 } from '@scure/base';
import { MultibaseCodec, MultibaseAlgorithm } from './multibase-codec';

/**
 * `KeysUtility` is a simple utility class for working with public keys transformed into different formats.
 */
export class KeysUtility {
  private constructor(private readonly bytes: Uint8Array) {}

  /**
   * Transforms the public key into a multibase string.
   * Default algorithm is 'base58btc'.
   * @returns The multibase string.
   */
  toMultibase(algorithm: MultibaseAlgorithm = 'base58btc'): string {
    return MultibaseCodec.encode(this.bytes, algorithm);
  }

  /**
   * Transforms the public key into a Hashgraph PublicKey instance.
   * @returns The Hashgraph PublicKey instance.
   */
  toPublicKey(): PublicKey {
    return PublicKey.fromBytes(this.bytes);
  }

  /**
   * Transforms the public key into a Uint8Array.
   * @returns The Uint8Array.
   */
  toBytes(): Uint8Array {
    return this.bytes;
  }

  /**
   * Transforms the public key into a base58 string.
   * @returns The base58 string.
   */
  toBase58(): string {
    const publicKeyBase58 = base58.encode(this.bytes);
    return publicKeyBase58;
  }

  /**
   * Loads a public key from a Hashgraph PublicKey instance.
   * @param publicKey The Hashgraph PublicKey instance.
   * @returns The KeysUtility instance.
   */
  static fromPublicKey(publicKey: PublicKey): KeysUtility {
    return new KeysUtility(publicKey.toBytesRaw());
  }

  /**
   * Loads a public key from a der string.
   * @param der The der string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromDerString(der: string): KeysUtility {
    const publicKey = PublicKey.fromString(der);
    return KeysUtility.fromPublicKey(publicKey);
  }

  /**
   * Loads a public key from a raw bytes.
   * @param bytes The raw bytes representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromBytes(bytes: Uint8Array): KeysUtility {
    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a base58 string.
   * @param base58 The base58 string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromBase58(base58String: string): KeysUtility {
    const bytes = base58.decode(base58String);
    return new KeysUtility(bytes);
  }

  /**
   * Loads a public key from a multibase string.
   * @param multibase The multibase string representing the public key.
   * @returns The KeysUtility instance.
   */
  static fromMultibase(multibase: string): KeysUtility {
    const bytes = MultibaseCodec.decode(multibase);
    return new KeysUtility(bytes);
  }
}
